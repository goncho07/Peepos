<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema Educativo PEEPOS</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            max-width: 800px;
            width: 90%;
            text-align: center;
        }
        
        .logo {
            font-size: 3rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 20px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 40px;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .feature h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .feature p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .status {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .api-info {
            background: #e2e3e5;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .api-info h4 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .api-endpoint {
            background: #fff;
            padding: 10px;
            border-radius: 5px;
            margin: 5px 0;
            font-family: monospace;
            border-left: 3px solid #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎓 PEEPOS</div>
        <div class="subtitle">Sistema de Gestión Educativa</div>
        
        <div class="features">
            <div class="feature">
                <h3>👥 Gestión de Estudiantes</h3>
                <p>Administra perfiles, inscripciones y seguimiento académico de estudiantes</p>
            </div>
            <div class="feature">
                <h3>👨‍🏫 Gestión de Profesores</h3>
                <p>Control de personal docente, asignaciones y horarios</p>
            </div>
            <div class="feature">
                <h3>📚 Cursos y Materias</h3>
                <p>Organización de cursos, materias y contenido académico</p>
            </div>
            <div class="feature">
                <h3>📊 Calificaciones</h3>
                <p>Sistema de evaluación y seguimiento de notas</p>
            </div>
            <div class="feature">
                <h3>📅 Asistencia</h3>
                <p>Control de asistencia y puntualidad</p>
            </div>
            <div class="feature">
                <h3>💬 Comunicaciones</h3>
                <p>Sistema de mensajería y notificaciones</p>
            </div>
        </div>
        
        <div class="status">
            <strong>✅ Sistema Activo</strong><br>
            Base de datos configurada y migraciones ejecutadas correctamente
        </div>
        
        <div class="api-info">
            <h4>🔗 Endpoints API Disponibles</h4>
            <div class="api-endpoint">GET /api/students - Lista de estudiantes</div>
            <div class="api-endpoint">GET /api/teachers - Lista de profesores</div>
            <div class="api-endpoint">GET /api/courses - Lista de cursos</div>
            <div class="api-endpoint">GET /api/grades - Calificaciones</div>
            <div class="api-endpoint">GET /api/attendances - Registros de asistencia</div>
        </div>
    </div>
</body>
</html>