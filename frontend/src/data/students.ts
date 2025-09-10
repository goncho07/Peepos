interface Student {
  documentNumber: string;
  studentCode: string;
  paternalLastName: string;
  maternalLastName: string;
  names: string;
  fullName: string;
  gender: 'Hombre' | 'Mujer';
  birthDate: string;
  grade: string;
  section: string;
  avatarUrl: string;
}

const formatName = (p: string, m: string, n: string) => `${p} ${m}, ${n}`.toUpperCase();

export const students: Student[] = [
  // PRIMERO A
  { documentNumber: '91074858', studentCode: '00000091074858', paternalLastName: 'ACUACHE', maternalLastName: 'GRANDE', names: 'FLAVIA VALENTINA', fullName: formatName('ACUACHE', 'GRANDE', 'FLAVIA VALENTINA'), gender: 'Mujer', birthDate: '17/10/2018', grade: 'Primer Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/91074858/100/100' },
  { documentNumber: '90798511', studentCode: '00000090798511', paternalLastName: 'ALVARADO', maternalLastName: 'CHUMBE', names: 'ARIANA GABRIELLA', fullName: formatName('ALVARADO', 'CHUMBE', 'ARIANA GABRIELLA'), gender: 'Mujer', birthDate: '09/05/2018', grade: 'Primer Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/90798511/100/100' },
  { documentNumber: '92559241', studentCode: '00000092559241', paternalLastName: 'ARANGURI', maternalLastName: 'PATIÑO', names: 'IVANA DEL CARMEN', fullName: formatName('ARANGURI', 'PATIÑO', 'IVANA DEL CARMEN'), gender: 'Mujer', birthDate: '24/04/2018', grade: 'Primer Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/92559241/100/100' },
  { documentNumber: '91036332', studentCode: '00000091036332', paternalLastName: 'CASA', maternalLastName: 'BACAN', names: 'SEBASTIAN MATHIAS', fullName: formatName('CASA', 'BACAN', 'SEBASTIAN MATHIAS'), gender: 'Hombre', birthDate: '11/10/2018', grade: 'Primer Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/91036332/100/100' },
  { documentNumber: '9092193', studentCode: '0000009092193', paternalLastName: 'RODRIGUEZ', maternalLastName: 'MORALES', names: 'MARIANELLA JOSÉ', fullName: formatName('RODRIGUEZ', 'MORALES', 'MARIANELLA JOSÉ'), gender: 'Mujer', birthDate: '04/10/2018', grade: 'Primer Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/9092193/100/100' },
  
  // PRIMERO B
  { documentNumber: '91007372', studentCode: '2205024270030', paternalLastName: 'ALVARADO', maternalLastName: 'CELIS', names: 'ANDRY BASTIAN', fullName: formatName('ALVARADO', 'CELIS', 'ANDRY BASTIAN'), gender: 'Hombre', birthDate: '30/09/2018', grade: 'Primer Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/91007372/100/100' },
  { documentNumber: '91204296', studentCode: '00000091204296', paternalLastName: 'ARBILDO', maternalLastName: 'RODRIGUEZ', names: 'ALDANA BRIDEY', fullName: formatName('ARBILDO', 'RODRIGUEZ', 'ALDANA BRIDEY'), gender: 'Mujer', birthDate: '27/08/2018', grade: 'Primer Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/91204296/100/100' },
  { documentNumber: '9100481', studentCode: '2305024270040', paternalLastName: 'CAMPOS', maternalLastName: 'MARTINEZ', names: 'AUSTIN SMITH', fullName: formatName('CAMPOS', 'MARTINEZ', 'AUSTIN SMITH'), gender: 'Hombre', birthDate: '08/10/2018', grade: 'Primer Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/9100481/100/100' },
  { documentNumber: '90920621', studentCode: '00000090920621', paternalLastName: 'CARHUAS', maternalLastName: 'CUCHO', names: 'AITANA SOFIA', fullName: formatName('CARHUAS', 'CUCHO', 'AITANA SOFIA'), gender: 'Mujer', birthDate: '05/08/2018', grade: 'Primer Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/90920621/100/100' },
  { documentNumber: '91184610', studentCode: '00000091184610', paternalLastName: 'GUERRERO', maternalLastName: 'LANDEO', names: 'JULIETA DAYANA ROSARIO', fullName: formatName('GUERRERO', 'LANDEO', 'JULIETA DAYANA ROSARIO'), gender: 'Mujer', birthDate: '17/01/2019', grade: 'Primer Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/91184610/100/100' },

  // SEGUNDO A
  { documentNumber: '9036103', studentCode: '2015124900028', paternalLastName: 'AGUILAR', maternalLastName: 'CARPIO', names: 'NAHUM VALENTINO', fullName: formatName('AGUILAR', 'CARPIO', 'NAHUM VALENTINO'), gender: 'Hombre', birthDate: '06/02/2017', grade: 'Segundo Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/9036103/100/100' },
  { documentNumber: '90117846', studentCode: '00000090117846', paternalLastName: 'ARBILDO', maternalLastName: 'RODRIGUEZ', names: 'BRIANNA KHALEESI', fullName: formatName('ARBILDO', 'RODRIGUEZ', 'BRIANNA KHALEESI'), gender: 'Mujer', birthDate: '23/01/2017', grade: 'Segundo Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/90117846/100/100' },
  { documentNumber: '79835408', studentCode: '2005024270098', paternalLastName: 'ARGUEDAS', maternalLastName: 'FERNANDEZ', names: 'JAZZ ALITZA', fullName: formatName('ARGUEDAS', 'FERNANDEZ', 'JAZZ ALITZA'), gender: 'Mujer', birthDate: '27/08/2016', grade: 'Segundo Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/79835408/100/100' },
  { documentNumber: '90282101', studentCode: '00000090282101', paternalLastName: 'BRAVO', maternalLastName: 'ALEJAR', names: 'MARCELO SEBASTIAN', fullName: formatName('BRAVO', 'ALEJAR', 'MARCELO SEBASTIAN'), gender: 'Hombre', birthDate: '04/05/2017', grade: 'Segundo Grado', section: 'A', avatarUrl: 'https://picsum.photos/seed/90282101/100/100' },

  // SEGUNDO B
  { documentNumber: '90435976', studentCode: '00000090435976', paternalLastName: 'ALVAREZ', maternalLastName: 'VASCO', names: 'ARANZA VIRGINIA', fullName: formatName('ALVAREZ', 'VASCO', 'ARANZA VIRGINIA'), gender: 'Mujer', birthDate: '25/04/2017', grade: 'Segundo Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/90435976/100/100' },
  { documentNumber: '9048451', studentCode: '00000090484451', paternalLastName: 'ANDRES', maternalLastName: 'ALVAREZ', names: 'GIANPIERO BENJAMIN', fullName: formatName('ANDRES', 'ALVAREZ', 'GIANPIERO BENJAMIN'), gender: 'Hombre', birthDate: '01/11/2017', grade: 'Segundo Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/9048451/100/100' },
  { documentNumber: '90316154', studentCode: '00000090316154', paternalLastName: 'BERNAL', maternalLastName: 'PANAIJO', names: 'LIAM DAVID', fullName: formatName('BERNAL', 'PANAIJO', 'LIAM DAVID'), gender: 'Hombre', birthDate: '13/07/2017', grade: 'Segundo Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/90316154/100/100' },
  { documentNumber: '90248674', studentCode: '00000090248674', paternalLastName: 'BRAVO', maternalLastName: 'BAUTISTA', names: 'JUAN NAHUEL', fullName: formatName('BRAVO', 'BAUTISTA', 'JUAN NAHUEL'), gender: 'Hombre', birthDate: '20/05/2017', grade: 'Segundo Grado', section: 'B', avatarUrl: 'https://picsum.photos/seed/90248674/100/100' }
];