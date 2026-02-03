/**
 * @fileoverview Tests de Validación para Conductores y Vehículos
 * 
 * Suite de tests para validar la lógica de negocio de conductores,
 * vehículos, asignaciones y documentos.
 * 
 * @module tests/integration/fleet-validation
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  driverSchema,
  medicalExamSchema,
  validateDriverEligibility,
  validateLicenseVehicleCompatibility,
  validateDailyDrivingHours,
  validateWeeklyDrivingHours,
  getDaysUntilExpiry,
  getExpiryAlertLevel,
  LICENSE_CATEGORIES,
  LICENSE_VEHICLE_COMPATIBILITY,
} from "@/lib/validators/driver-validators";

import {
  vehicleSchema,
  vehicleSpecsSchema,
  insurancePolicySchema,
  technicalInspectionSchema,
  validateVehicleEligibility,
  validateDriverVehicleCompatibility,
  calculateNextMaintenance,
  calculateFuelEfficiency,
  isValidPeruvianPlate,
  formatPlate,
  VEHICLE_TYPES,
  MAINTENANCE_INTERVALS,
} from "@/lib/validators/vehicle-validators";

/* ============================================
   TESTS DE VALIDACIÓN DE CONDUCTORES
   ============================================ */

describe("Driver Validators", () => {
  describe("driverSchema", () => {
    it("should validate a complete driver object", () => {
      const validDriver = {
        id: "drv-001",
        name: "Carlos Pérez García",
        email: "carlos@example.com",
        phone: "987654321",
        status: "active",
        documentType: "dni",
        documentNumber: "12345678",
        birthDate: "1985-03-15",
        licenseNumber: "Q12345678",
        licenseType: "A-IIIb",
        licenseExpiry: "2026-03-15",
        emergencyContacts: [
          { name: "María García", relationship: "Esposa", phone: "987654322" }
        ],
      };

      const result = driverSchema.safeParse(validDriver);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidDriver = {
        name: "Test Driver",
        email: "invalid-email",
        phone: "987654321",
        status: "active",
      };

      const result = driverSchema.safeParse(invalidDriver);
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const invalidDriver = {
        name: "Test Driver",
        email: "test@example.com",
        phone: "987654321",
        status: "invalid_status",
      };

      const result = driverSchema.safeParse(invalidDriver);
      expect(result.success).toBe(false);
    });
  });

  describe("medicalExamSchema", () => {
    it("should validate a valid medical exam", () => {
      const validExam = {
        type: "periodic",
        date: "2025-06-01",
        expiryDate: "2026-06-01",
        result: "approved",
        clinicName: "Clínica San Pablo",
        clinicRuc: "20100091896",
        doctorName: "Dr. Roberto Sánchez",
        doctorCmp: "012345",
        certificateNumber: "MED-2025-001",
      };

      const result = medicalExamSchema.safeParse(validExam);
      expect(result.success).toBe(true);
    });

    it("should reject exam with invalid result", () => {
      const invalidExam = {
        type: "periodic",
        date: "2025-06-01",
        result: "invalid_result",
      };

      const result = medicalExamSchema.safeParse(invalidExam);
      expect(result.success).toBe(false);
    });
  });

  describe("LICENSE_CATEGORIES", () => {
    it("should contain all MTC Peru license categories", () => {
      expect(LICENSE_CATEGORIES).toContain("A-I");
      expect(LICENSE_CATEGORIES).toContain("A-IIa");
      expect(LICENSE_CATEGORIES).toContain("A-IIb");
      expect(LICENSE_CATEGORIES).toContain("A-IIIa");
      expect(LICENSE_CATEGORIES).toContain("A-IIIb");
      expect(LICENSE_CATEGORIES).toContain("A-IIIc");
    });
  });

  describe("LICENSE_VEHICLE_COMPATIBILITY", () => {
    it("should allow A-IIIc to drive all vehicle types", () => {
      const allowed = LICENSE_VEHICLE_COMPATIBILITY["A-IIIc"];
      expect(allowed).toContain("truck");
      expect(allowed).toContain("van");
      expect(allowed).toContain("trailer");
      expect(allowed).toContain("tanker");
    });

    it("should restrict A-I to motorcycles only", () => {
      const allowed = LICENSE_VEHICLE_COMPATIBILITY["A-I"];
      expect(allowed).toContain("motorcycle");
      expect(allowed).not.toContain("truck");
    });

    it("should allow A-IIa small vehicles", () => {
      const allowed = LICENSE_VEHICLE_COMPATIBILITY["A-IIa"];
      expect(allowed).toContain("car");
      expect(allowed).toContain("van");
      expect(allowed).toContain("pickup");
      expect(allowed).not.toContain("truck");
    });
  });

  describe("validateLicenseVehicleCompatibility", () => {
    it("should return true for compatible license-vehicle", () => {
      expect(validateLicenseVehicleCompatibility("A-IIIb", "truck")).toBe(true);
      expect(validateLicenseVehicleCompatibility("A-IIa", "van")).toBe(true);
      expect(validateLicenseVehicleCompatibility("A-I", "motorcycle")).toBe(true);
    });

    it("should return false for incompatible license-vehicle", () => {
      expect(validateLicenseVehicleCompatibility("A-I", "truck")).toBe(false);
      expect(validateLicenseVehicleCompatibility("A-IIa", "trailer")).toBe(false);
    });
  });

  describe("getDaysUntilExpiry", () => {
    it("should calculate days correctly for future date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const days = getDaysUntilExpiry(futureDate.toISOString());
      expect(days).toBeCloseTo(30, 0);
    });

    it("should return negative for past date", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      
      const days = getDaysUntilExpiry(pastDate.toISOString());
      expect(days).toBeLessThan(0);
    });
  });

  describe("getExpiryAlertLevel", () => {
    it("should return 'expired' for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      expect(getExpiryAlertLevel(pastDate.toISOString())).toBe("expired");
    });

    it("should return 'urgent' for dates within 15 days", () => {
      const urgentDate = new Date();
      urgentDate.setDate(urgentDate.getDate() + 10);
      
      expect(getExpiryAlertLevel(urgentDate.toISOString())).toBe("urgent");
    });

    it("should return 'warning' for dates within 30 days", () => {
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 25);
      
      expect(getExpiryAlertLevel(warningDate.toISOString())).toBe("warning");
    });

    it("should return 'ok' for dates beyond 30 days", () => {
      const okDate = new Date();
      okDate.setDate(okDate.getDate() + 60);
      
      expect(getExpiryAlertLevel(okDate.toISOString())).toBe("ok");
    });
  });

  describe("validateDailyDrivingHours", () => {
    it("should return valid for hours under 8", () => {
      const result = validateDailyDrivingHours(6);
      expect(result.isValid).toBe(true);
    });

    it("should return invalid for hours over 8", () => {
      const result = validateDailyDrivingHours(10);
      expect(result.isValid).toBe(false);
      expect(result.exceeded).toBe(2);
    });

    it("should return remaining hours correctly", () => {
      const result = validateDailyDrivingHours(5);
      expect(result.remaining).toBe(3);
    });
  });

  describe("validateWeeklyDrivingHours", () => {
    it("should return valid for hours under 48", () => {
      const result = validateWeeklyDrivingHours(40);
      expect(result.isValid).toBe(true);
    });

    it("should return invalid for hours over 48", () => {
      const result = validateWeeklyDrivingHours(55);
      expect(result.isValid).toBe(false);
      expect(result.exceeded).toBe(7);
    });
  });
});

/* ============================================
   TESTS DE VALIDACIÓN DE VEHÍCULOS
   ============================================ */

describe("Vehicle Validators", () => {
  describe("vehicleSchema", () => {
    it("should validate a complete vehicle object", () => {
      const validVehicle = {
        id: "v001",
        plate: "ABC-123",
        type: "truck",
        brand: "Volvo",
        model: "FH16",
        year: 2022,
        status: "active",
        operationalStatus: "operational",
      };

      const result = vehicleSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);
    });

    it("should reject invalid vehicle type", () => {
      const invalidVehicle = {
        id: "v001",
        plate: "ABC-123",
        type: "invalid_type",
        brand: "Volvo",
        model: "FH16",
        year: 2022,
        status: "active",
      };

      const result = vehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
    });
  });

  describe("insurancePolicySchema", () => {
    it("should validate a valid SOAT policy", () => {
      const validPolicy = {
        type: "soat",
        provider: "Rímac Seguros",
        policyNumber: "SOAT-2025-001234",
        startDate: "2025-01-01",
        endDate: "2026-01-01",
        coverage: 1250000,
        premium: 850,
        status: "active",
      };

      const result = insurancePolicySchema.safeParse(validPolicy);
      expect(result.success).toBe(true);
    });
  });

  describe("isValidPeruvianPlate", () => {
    it("should validate correct Peruvian plate formats", () => {
      expect(isValidPeruvianPlate("ABC-123")).toBe(true);
      expect(isValidPeruvianPlate("XYZ-999")).toBe(true);
      expect(isValidPeruvianPlate("A1B-234")).toBe(true);
    });

    it("should reject invalid plate formats", () => {
      expect(isValidPeruvianPlate("ABCD-123")).toBe(false);
      expect(isValidPeruvianPlate("AB-1234")).toBe(false);
      expect(isValidPeruvianPlate("123-ABC")).toBe(false);
      expect(isValidPeruvianPlate("ABC123")).toBe(false);
    });
  });

  describe("formatPlate", () => {
    it("should format plates correctly", () => {
      expect(formatPlate("abc123")).toBe("ABC-123");
      expect(formatPlate("ABC123")).toBe("ABC-123");
      expect(formatPlate("abc-123")).toBe("ABC-123");
    });
  });

  describe("VEHICLE_TYPES", () => {
    it("should contain all standard vehicle types", () => {
      expect(VEHICLE_TYPES).toContain("truck");
      expect(VEHICLE_TYPES).toContain("van");
      expect(VEHICLE_TYPES).toContain("pickup");
      expect(VEHICLE_TYPES).toContain("trailer");
      expect(VEHICLE_TYPES).toContain("tanker");
      expect(VEHICLE_TYPES).toContain("refrigerated");
    });
  });

  describe("MAINTENANCE_INTERVALS", () => {
    it("should have correct intervals for preventive maintenance", () => {
      const preventive = MAINTENANCE_INTERVALS.preventive;
      expect(preventive.km).toBe(10000);
      expect(preventive.months).toBe(6);
    });

    it("should have correct intervals for oil change", () => {
      const oilChange = MAINTENANCE_INTERVALS.oil_change;
      expect(oilChange.km).toBe(5000);
      expect(oilChange.months).toBe(3);
    });
  });

  describe("calculateNextMaintenance", () => {
    it("should calculate next maintenance date correctly", () => {
      const lastDate = new Date("2025-01-01");
      const currentMileage = 80000;
      const lastMileage = 75000;

      const result = calculateNextMaintenance("preventive", lastDate, currentMileage, lastMileage);
      
      expect(result.nextDate).toBeDefined();
      expect(result.nextMileage).toBe(lastMileage + MAINTENANCE_INTERVALS.preventive.km);
    });

    it("should indicate overdue when past due date", () => {
      const lastDate = new Date("2024-01-01"); // Over a year ago
      const currentMileage = 100000;
      const lastMileage = 75000;

      const result = calculateNextMaintenance("preventive", lastDate, currentMileage, lastMileage);
      
      expect(result.isOverdue).toBe(true);
    });
  });

  describe("calculateFuelEfficiency", () => {
    it("should calculate km per liter correctly", () => {
      const distance = 500; // km
      const fuelUsed = 100; // liters

      const result = calculateFuelEfficiency(distance, fuelUsed);
      
      expect(result.kmPerLiter).toBe(5);
      expect(result.litersPerHundredKm).toBe(20);
    });

    it("should handle zero values", () => {
      const result = calculateFuelEfficiency(0, 100);
      
      expect(result.kmPerLiter).toBe(0);
    });
  });
});

/* ============================================
   TESTS DE ELEGIBILIDAD
   ============================================ */

describe("Eligibility Validators", () => {
  describe("validateDriverEligibility", () => {
    const baseDriver = {
      id: "drv-001",
      name: "Test Driver",
      email: "test@example.com",
      phone: "987654321",
      status: "active" as const,
      licenseNumber: "Q12345678",
      licenseType: "A-IIIb",
    };

    it("should return eligible for active driver with valid license", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const driver = {
        ...baseDriver,
        license: {
          number: "Q12345678",
          category: "A-IIIb",
          expiryDate: futureDate.toISOString(),
          isValid: true,
        },
        medicalExamHistory: [{
          id: "med-001",
          type: "periodic" as const,
          date: new Date().toISOString(),
          expiryDate: futureDate.toISOString(),
          result: "approved" as const,
          createdAt: new Date().toISOString(),
        }],
        psychologicalExamHistory: [{
          id: "psy-001",
          date: new Date().toISOString(),
          expiryDate: futureDate.toISOString(),
          result: "approved" as const,
          createdAt: new Date().toISOString(),
        }],
      };

      const result = validateDriverEligibility(driver as any);
      expect(result.isEligible).toBe(true);
    });

    it("should return ineligible for inactive driver", () => {
      const driver = {
        ...baseDriver,
        status: "inactive" as const,
      };

      const result = validateDriverEligibility(driver as any);
      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContain("Conductor no está activo");
    });

    it("should return ineligible for expired license", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      
      const driver = {
        ...baseDriver,
        licenseExpiry: pastDate.toISOString(),
      };

      const result = validateDriverEligibility(driver as any);
      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContain("Licencia de conducir vencida");
    });
  });

  describe("validateVehicleEligibility", () => {
    const baseVehicle = {
      id: "v001",
      plate: "ABC-123",
      type: "truck" as const,
      brand: "Volvo",
      model: "FH16",
      year: 2022,
      status: "active" as const,
      operationalStatus: "operational" as const,
    };

    it("should return eligible for active vehicle with valid documents", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const vehicle = {
        ...baseVehicle,
        insurancePolicies: [{
          id: "ins-001",
          type: "soat" as const,
          provider: "Rimac",
          policyNumber: "SOAT-001",
          startDate: new Date().toISOString(),
          endDate: futureDate.toISOString(),
          status: "active" as const,
        }],
        currentInspection: {
          id: "insp-001",
          date: new Date().toISOString(),
          expiryDate: futureDate.toISOString(),
          result: "approved" as const,
          createdAt: new Date().toISOString(),
        },
      };

      const result = validateVehicleEligibility(vehicle as any);
      expect(result.isEligible).toBe(true);
    });

    it("should return ineligible for inactive vehicle", () => {
      const vehicle = {
        ...baseVehicle,
        status: "inactive" as const,
      };

      const result = validateVehicleEligibility(vehicle as any);
      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContain("Vehículo no está activo");
    });

    it("should return ineligible for vehicle in maintenance", () => {
      const vehicle = {
        ...baseVehicle,
        operationalStatus: "in_maintenance" as const,
      };

      const result = validateVehicleEligibility(vehicle as any);
      expect(result.isEligible).toBe(false);
      expect(result.reasons).toContain("Vehículo en mantenimiento");
    });
  });

  describe("validateDriverVehicleCompatibility", () => {
    it("should return compatible for matching license and vehicle", () => {
      const driver = {
        id: "drv-001",
        license: { category: "A-IIIb" },
      };
      const vehicle = {
        id: "v001",
        type: "truck",
      };

      const result = validateDriverVehicleCompatibility(driver as any, vehicle as any);
      expect(result.isCompatible).toBe(true);
    });

    it("should return incompatible for mismatched license and vehicle", () => {
      const driver = {
        id: "drv-001",
        license: { category: "A-I" },
      };
      const vehicle = {
        id: "v001",
        type: "truck",
      };

      const result = validateDriverVehicleCompatibility(driver as any, vehicle as any);
      expect(result.isCompatible).toBe(false);
    });
  });
});

/* ============================================
   TESTS DE INTEGRACIÓN
   ============================================ */

describe("Integration Tests", () => {
  describe("Complete Assignment Flow", () => {
    it("should validate complete assignment flow", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const driver = {
        id: "drv-001",
        name: "Carlos Pérez",
        email: "carlos@example.com",
        phone: "987654321",
        status: "active" as const,
        license: {
          number: "Q12345678",
          category: "A-IIIb",
          expiryDate: futureDate.toISOString(),
          isValid: true,
        },
        licenseType: "A-IIIb",
        licenseExpiry: futureDate.toISOString(),
        medicalExamHistory: [{
          id: "med-001",
          type: "periodic" as const,
          date: new Date().toISOString(),
          expiryDate: futureDate.toISOString(),
          result: "approved" as const,
          createdAt: new Date().toISOString(),
        }],
        psychologicalExamHistory: [{
          id: "psy-001",
          date: new Date().toISOString(),
          expiryDate: futureDate.toISOString(),
          result: "approved" as const,
          createdAt: new Date().toISOString(),
        }],
      };

      const vehicle = {
        id: "v001",
        plate: "ABC-123",
        type: "truck" as const,
        brand: "Volvo",
        model: "FH16",
        year: 2022,
        status: "active" as const,
        operationalStatus: "operational" as const,
        insurancePolicies: [{
          id: "ins-001",
          type: "soat" as const,
          provider: "Rimac",
          policyNumber: "SOAT-001",
          startDate: new Date().toISOString(),
          endDate: futureDate.toISOString(),
          status: "active" as const,
        }],
        currentInspection: {
          id: "insp-001",
          date: new Date().toISOString(),
          expiryDate: futureDate.toISOString(),
          result: "approved" as const,
          createdAt: new Date().toISOString(),
        },
      };

      // Step 1: Validate driver eligibility
      const driverEligibility = validateDriverEligibility(driver as any);
      expect(driverEligibility.isEligible).toBe(true);

      // Step 2: Validate vehicle eligibility
      const vehicleEligibility = validateVehicleEligibility(vehicle as any);
      expect(vehicleEligibility.isEligible).toBe(true);

      // Step 3: Validate compatibility
      const compatibility = validateDriverVehicleCompatibility(driver as any, vehicle as any);
      expect(compatibility.isCompatible).toBe(true);

      // Step 4: Validate license-vehicle compatibility
      const licenseCompat = validateLicenseVehicleCompatibility("A-IIIb", "truck");
      expect(licenseCompat).toBe(true);
    });
  });
});
