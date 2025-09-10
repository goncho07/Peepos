<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

trait HasApiCrud
{
    /**
     * Apply common filters to query.
     */
    protected function applyCommonFilters($query, Request $request, array $searchFields = [])
    {
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search') && !empty($searchFields)) {
            $search = $request->search;
            $query->where(function ($q) use ($search, $searchFields) {
                foreach ($searchFields as $field) {
                    if (str_contains($field, '.')) {
                        // Handle relationship fields
                        [$relation, $relationField] = explode('.', $field);
                        $q->orWhereHas($relation, function ($relationQuery) use ($search, $relationField) {
                            $relationQuery->where($relationField, 'like', "%{$search}%");
                        });
                    } else {
                        // Handle direct fields
                        $q->orWhere($field, 'like', "%{$search}%");
                    }
                }
            });
        }

        return $query;
    }

    /**
     * Apply date range filters.
     */
    protected function applyDateRangeFilter($query, Request $request, string $dateField, string $fromParam, string $toParam)
    {
        if ($request->has($fromParam)) {
            $query->where($dateField, '>=', $request->get($fromParam));
        }
        if ($request->has($toParam)) {
            $query->where($dateField, '<=', $request->get($toParam));
        }
        return $query;
    }

    /**
     * Standard success response.
     */
    protected function successResponse($data, string $message = null, int $status = Response::HTTP_OK)
    {
        $response = ['success' => true];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        $response['data'] = $data;
        
        return response()->json($response, $status);
    }

    /**
     * Standard error response.
     */
    protected function errorResponse(string $message, int $status = Response::HTTP_BAD_REQUEST, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $status);
    }

    /**
     * Standard not found response.
     */
    protected function notFoundResponse(string $resource = 'Resource')
    {
        return $this->errorResponse("{$resource} not found", Response::HTTP_NOT_FOUND);
    }
}