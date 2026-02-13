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


describe("Driver Validators", () => {
  describe("driverSchema", () => {
    it("should validate a complete driver object", () => {
      const validDriver = {
        id: "drv-001",
        name: "Carlos Pérez García",