/**
 * @fileoverview Servicio de Exámenes Médicos y Psicológicos
 * 
 * Gestiona los exámenes ocupacionales de conductores según
 * normativa peruana de seguridad y salud en el trabajo.
 * 
 * @module services/master/medical-exams.service
 */

import { 
  MedicalExam, 
  PsychologicalExam, 
  MedicalExamType,
  ExamResult,
  MedicalRestriction,
} from "@/types/models/driver";

/* ============================================
   TIPOS Y CONSTANTES
   ============================================ */

/**
 * Estadísticas de exámenes
 */
export interface ExamStats {
  totalMedical: number;
  totalPsychological: number;
  approvedMedical: number;
  approvedPsychological: number;
  expiringSoonMedical: number;
  expiringSoonPsychological: number;
  expiredMedical: number;
  expiredPsychological: number;
}

/**
 * Filtros para búsqueda de exámenes
 */
export interface ExamFilters {
  driverId?: string;
  type?: MedicalExamType;
  result?: ExamResult;
  dateFrom?: string;
  dateTo?: string;
  expiringWithinDays?: number;
}

/**
 * Clínicas autorizadas (mock)
 */
export const AUTHORIZED_CLINICS = [
  { id: "clinic-001", name: "Clínica San Pablo", ruc: "20100091896", city: "Lima" },
  { id: "clinic-002", name: "Clínica Javier Prado", ruc: "20101090231", city: "Lima" },
  { id: "clinic-003", name: "Clínica Ricardo Palma", ruc: "20100041953", city: "Lima" },
  { id: "clinic-004", name: "Clínica Internacional", ruc: "20100055237", city: "Lima" },
  { id: "clinic-005", name: "Clínica Delgado", ruc: "20100116635", city: "Lima" },
];

/**
 * Centros psicológicos autorizados (mock)
 */
export const AUTHORIZED_PSYCH_CENTERS = [
  { id: "psych-001", name: "Centro de Evaluación Psicológica CEPP", city: "Lima" },
  { id: "psych-002", name: "Instituto Psicológico Peruano", city: "Lima" },
  { id: "psych-003", name: "Centro de Salud Mental San Juan", city: "Lima" },
];

/**
 * Restricciones médicas comunes
 */
export const COMMON_MEDICAL_RESTRICTIONS: MedicalRestriction[] = [
  { code: "R001", description: "Uso obligatorio de lentes correctivos", isTemporary: false, affectsDriving: true },
  { code: "R002", description: "Uso obligatorio de audífonos", isTemporary: false, affectsDriving: true },
  { code: "R003", description: "Prohibido conducir de noche", isTemporary: false, affectsDriving: true },
  { code: "R004", description: "Solo transmisión automática", isTemporary: false, affectsDriving: true },
  { code: "R005", description: "Máximo 6 horas de conducción diaria", isTemporary: true, affectsDriving: true },
  { code: "R006", description: "Requiere descanso cada 2 horas", isTemporary: true, affectsDriving: true },
  { code: "R007", description: "Control de presión arterial mensual", isTemporary: true, affectsDriving: false },
  { code: "R008", description: "Control de glucosa mensual", isTemporary: true, affectsDriving: false },
];

/* ============================================
   DATOS MOCK
   ============================================ */

const medicalExamsMock: MedicalExam[] = [
  {
    id: "med-001",
    type: "periodic",
    date: "2025-06-15",
    expiryDate: "2026-06-15",
    result: "approved",
    restrictions: [],
    clinicName: "Clínica San Pablo",
    clinicRuc: "20100091896",
    doctorName: "Dr. Carlos Mendoza",
    doctorCmp: "012345",
    certificateNumber: "MED-2025-001234",
    fileUrl: "/documents/medical/med-001.pdf",
    observations: "Conductor en óptimas condiciones de salud",
    createdAt: "2025-06-15T10:00:00Z",
  },
  {
    id: "med-002",
    type: "pre_employment",
    date: "2025-01-10",
    expiryDate: "2026-01-10",
    result: "conditional",
    restrictions: [
      { code: "R001", description: "Uso obligatorio de lentes correctivos", isTemporary: false, affectsDriving: true },
    ],
    clinicName: "Clínica Javier Prado",
    clinicRuc: "20101090231",
    doctorName: "Dra. María García",
    doctorCmp: "023456",
    certificateNumber: "MED-2025-000456",
    fileUrl: "/documents/medical/med-002.pdf",
    observations: "Requiere uso de lentes para conducir",
    createdAt: "2025-01-10T09:30:00Z",
  },
];

const psychologicalExamsMock: PsychologicalExam[] = [
  {
    id: "psy-001",
    date: "2025-06-15",
    expiryDate: "2026-06-15",
    result: "approved",
    centerName: "Centro de Evaluación Psicológica CEPP",
    psychologistName: "Lic. Ana Torres",
    psychologistLicense: "CPP-12345",
    certificateNumber: "PSY-2025-001234",
    profile: {
      stressLevel: "low",
      reactionTime: "normal",
      attentionLevel: "excellent",
      pressureHandling: "good",
      additionalNotes: "Perfil apto para conducción de carga pesada",
    },
    fileUrl: "/documents/psychological/psy-001.pdf",
    observations: "Conductor con perfil psicológico óptimo",
    createdAt: "2025-06-15T14:00:00Z",
  },
];

/* ============================================
   SERVICIO DE EXÁMENES MÉDICOS
   ============================================ */

class MedicalExamsService {
  private useMocks = true;
  private medicalExams = [...medicalExamsMock];
  private psychologicalExams = [...psychologicalExamsMock];

  /**
   * Simula delay de red
   */
  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Genera ID único
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}`;
  }

  /* --- EXÁMENES MÉDICOS --- */

  /**
   * Obtiene todos los exámenes médicos de un conductor
   */
  async getMedicalExamsByDriver(_driverId: string): Promise<MedicalExam[]> {
    await this.simulateDelay();
    // En mock, retornamos todos los exámenes (en producción se filtraría por driverId)
    return this.medicalExams;
  }

  /**
   * Obtiene un examen médico por ID
   */
  async getMedicalExamById(id: string): Promise<MedicalExam | null> {
    await this.simulateDelay();
    return this.medicalExams.find(e => e.id === id) || null;
  }

  /**
   * Crea un nuevo examen médico
   */
  async createMedicalExam(
    _driverId: string,
    data: Omit<MedicalExam, "id" | "createdAt">
  ): Promise<MedicalExam> {
    await this.simulateDelay(500);
    
    const newExam: MedicalExam = {
      ...data,
      id: this.generateId("med"),
      createdAt: new Date().toISOString(),
    };

    this.medicalExams.push(newExam);
    return newExam;
  }

  /**
   * Actualiza un examen médico
   */
  async updateMedicalExam(
    id: string,
    data: Partial<MedicalExam>
  ): Promise<MedicalExam> {
    await this.simulateDelay(400);
    
    const index = this.medicalExams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Examen médico con ID ${id} no encontrado`);
    }

    this.medicalExams[index] = { ...this.medicalExams[index], ...data };
    return this.medicalExams[index];
  }

  /**
   * Elimina un examen médico
   */
  async deleteMedicalExam(id: string): Promise<void> {
    await this.simulateDelay(300);
    
    const index = this.medicalExams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Examen médico con ID ${id} no encontrado`);
    }

    this.medicalExams.splice(index, 1);
  }

  /* --- EXÁMENES PSICOLÓGICOS --- */

  /**
   * Obtiene todos los exámenes psicológicos de un conductor
   */
  async getPsychologicalExamsByDriver(_driverId: string): Promise<PsychologicalExam[]> {
    await this.simulateDelay();
    return this.psychologicalExams;
  }

  /**
   * Obtiene un examen psicológico por ID
   */
  async getPsychologicalExamById(id: string): Promise<PsychologicalExam | null> {
    await this.simulateDelay();
    return this.psychologicalExams.find(e => e.id === id) || null;
  }

  /**
   * Crea un nuevo examen psicológico
   */
  async createPsychologicalExam(
    _driverId: string,
    data: Omit<PsychologicalExam, "id" | "createdAt">
  ): Promise<PsychologicalExam> {
    await this.simulateDelay(500);
    
    const newExam: PsychologicalExam = {
      ...data,
      id: this.generateId("psy"),
      createdAt: new Date().toISOString(),
    };

    this.psychologicalExams.push(newExam);
    return newExam;
  }

  /**
   * Actualiza un examen psicológico
   */
  async updatePsychologicalExam(
    id: string,
    data: Partial<PsychologicalExam>
  ): Promise<PsychologicalExam> {
    await this.simulateDelay(400);
    
    const index = this.psychologicalExams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Examen psicológico con ID ${id} no encontrado`);
    }

    this.psychologicalExams[index] = { ...this.psychologicalExams[index], ...data };
    return this.psychologicalExams[index];
  }

  /**
   * Elimina un examen psicológico
   */
  async deletePsychologicalExam(id: string): Promise<void> {
    await this.simulateDelay(300);
    
    const index = this.psychologicalExams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Examen psicológico con ID ${id} no encontrado`);
    }

    this.psychologicalExams.splice(index, 1);
  }

  /* --- ESTADÍSTICAS Y ALERTAS --- */

  /**
   * Obtiene estadísticas de exámenes
   */
  async getExamStats(): Promise<ExamStats> {
    await this.simulateDelay();
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return {
      totalMedical: this.medicalExams.length,
      totalPsychological: this.psychologicalExams.length,
      approvedMedical: this.medicalExams.filter(e => e.result === "approved").length,
      approvedPsychological: this.psychologicalExams.filter(e => e.result === "approved").length,
      expiringSoonMedical: this.medicalExams.filter(e => {
        const expiry = new Date(e.expiryDate);
        return expiry > today && expiry <= thirtyDaysFromNow;
      }).length,
      expiringSoonPsychological: this.psychologicalExams.filter(e => {
        const expiry = new Date(e.expiryDate);
        return expiry > today && expiry <= thirtyDaysFromNow;
      }).length,
      expiredMedical: this.medicalExams.filter(e => new Date(e.expiryDate) <= today).length,
      expiredPsychological: this.psychologicalExams.filter(e => new Date(e.expiryDate) <= today).length,
    };
  }

  /**
   * Obtiene exámenes próximos a vencer
   */
  async getExpiringExams(daysAhead: number = 30): Promise<{
    medical: MedicalExam[];
    psychological: PsychologicalExam[];
  }> {
    await this.simulateDelay();
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return {
      medical: this.medicalExams.filter(e => {
        const expiry = new Date(e.expiryDate);
        return expiry > today && expiry <= futureDate;
      }),
      psychological: this.psychologicalExams.filter(e => {
        const expiry = new Date(e.expiryDate);
        return expiry > today && expiry <= futureDate;
      }),
    };
  }

  /**
   * Obtiene exámenes vencidos
   */
  async getExpiredExams(): Promise<{
    medical: MedicalExam[];
    psychological: PsychologicalExam[];
  }> {
    await this.simulateDelay();
    
    const today = new Date();

    return {
      medical: this.medicalExams.filter(e => new Date(e.expiryDate) <= today),
      psychological: this.psychologicalExams.filter(e => new Date(e.expiryDate) <= today),
    };
  }

  /* --- VALIDACIONES --- */

  /**
   * Verifica si un conductor tiene exámenes vigentes
   */
  async hasValidExams(_driverId: string): Promise<{
    hasMedical: boolean;
    hasPsychological: boolean;
    medicalExpiry?: string;
    psychologicalExpiry?: string;
    issues: string[];
  }> {
    await this.simulateDelay();
    
    const today = new Date();
    const issues: string[] = [];

    // Buscar examen médico vigente más reciente
    const validMedical = this.medicalExams
      .filter(e => new Date(e.expiryDate) > today && e.result === "approved")
      .sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime())[0];

    // Buscar examen psicológico vigente más reciente
    const validPsychological = this.psychologicalExams
      .filter(e => new Date(e.expiryDate) > today && e.result === "approved")
      .sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime())[0];

    if (!validMedical) {
      issues.push("Sin examen médico vigente aprobado");
    }
    if (!validPsychological) {
      issues.push("Sin examen psicológico vigente aprobado");
    }

    return {
      hasMedical: !!validMedical,
      hasPsychological: !!validPsychological,
      medicalExpiry: validMedical?.expiryDate,
      psychologicalExpiry: validPsychological?.expiryDate,
      issues,
    };
  }

  /**
   * Obtiene restricciones médicas activas de un conductor
   */
  async getActiveRestrictions(_driverId: string): Promise<MedicalRestriction[]> {
    await this.simulateDelay();
    
    const today = new Date();
    const validExams = this.medicalExams.filter(
      e => new Date(e.expiryDate) > today
    );

    // Consolidar restricciones de todos los exámenes vigentes
    const restrictions: MedicalRestriction[] = [];
    for (const exam of validExams) {
      for (const restriction of exam.restrictions) {
        // Evitar duplicados
        if (!restrictions.find(r => r.code === restriction.code)) {
          restrictions.push(restriction);
        }
      }
    }

    return restrictions;
  }

  /* --- CATÁLOGOS --- */

  /**
   * Obtiene lista de clínicas autorizadas
   */
  getAuthorizedClinics() {
    return AUTHORIZED_CLINICS;
  }

  /**
   * Obtiene lista de centros psicológicos autorizados
   */
  getAuthorizedPsychCenters() {
    return AUTHORIZED_PSYCH_CENTERS;
  }

  /**
   * Obtiene lista de restricciones médicas comunes
   */
  getCommonRestrictions() {
    return COMMON_MEDICAL_RESTRICTIONS;
  }
}

/** Instancia singleton del servicio */
export const medicalExamsService = new MedicalExamsService();
