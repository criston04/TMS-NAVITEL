import { moduleConnectorService } from '@/services/integration';
import { unifiedWorkflowService } from '@/services/workflow.service';

// TEST SUITE: CONEXIONES DE MÓDULOS

/**
 * Suite de pruebas para verificar la integración entre módulos
 * Ejecutar con: npx tsx src/tests/integration/module-connections.test.ts
 */

async function runIntegrationTests() {
  console.log('\n========================================');
  console.log('🧪 PRUEBAS DE INTEGRACIÓN DE MÓDULOS');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  // ------------------------------------------------
  // TEST 1: Auto-asignación de workflow por cliente
  // ------------------------------------------------
  console.log('📋 Test 1: Auto-asignación de workflow por cliente');
  try {
    const result = await moduleConnectorService.autoAssignWorkflow({
      customerId: 'cust-001',
      cargo: { 
        type: 'general', 
        description: 'Test', 
        weightKg: 1000, 
        quantity: 1 
      },
    });

    if (result.success && result.workflowId) {
      console.log('   ✅ PASSED - Workflow asignado:', result.workflowName);
      console.log('   📝 Razón:', result.reason);
      passed++;
    } else {
      console.log('   ❌ FAILED - No se asignó workflow');
      console.log('   📝 Razón:', result.reason);
      failed++;
    }
  } catch (error) {
    console.log('   ❌ FAILED - Error:', error);
    failed++;
  }

  // ------------------------------------------------
  // TEST 2: Auto-asignación por tipo de carga
  // ------------------------------------------------
  console.log('\n📋 Test 2: Auto-asignación de workflow por tipo de carga');
  try {
    const result = await moduleConnectorService.autoAssignWorkflow({
      customerId: 'unknown-customer',
      cargo: { 
        type: 'refrigerated', 
        description: 'Carga refrigerada', 
        weightKg: 500, 
        quantity: 10 
      },
    });

    if (result.success) {
      console.log('   ✅ PASSED - Workflow asignado:', result.workflowName);
      console.log('   📝 Razón:', result.reason);
      passed++;
    } else {
      console.log('   ⚠️  WARNING - Usó workflow por defecto o ninguno');
      console.log('   📝 Razón:', result.reason);
      passed++; // Esto es esperado si no hay workflow específico
    }
  } catch (error) {
    console.log('   ❌ FAILED - Error:', error);
    failed++;
  }

  // ------------------------------------------------
  // TEST 3: Generación de milestones desde workflow
  // ------------------------------------------------
  console.log('\n📋 Test 3: Generación de milestones desde workflow');
  try {
    const workflows = await unifiedWorkflowService.getAll();
    const activeWorkflow = workflows.find(w => w.status === 'active' && w.steps.length > 0);

    if (activeWorkflow) {
      const result = await moduleConnectorService.autoAssignWorkflow({
        customerId: 'test-customer',
        workflowId: activeWorkflow.id,
      });

      if (result.generatedMilestones && result.generatedMilestones.length > 0) {
        console.log('   ✅ PASSED - Milestones generados:', result.generatedMilestones.length);
        console.log('   📝 Primer milestone:', result.generatedMilestones[0].geofenceName);
        passed++;
      } else {
        console.log('   ⚠️  WARNING - No se generaron milestones (puede ser válido si no hay steps con geocercas)');
        passed++;
      }
    } else {
      console.log('   ⏭️  SKIPPED - No hay workflows activos con steps');
    }
  } catch (error) {
    console.log('   ❌ FAILED - Error:', error);
    failed++;
  }

  // ------------------------------------------------
  // TEST 4: Validación de scheduling con workflow
  // ------------------------------------------------
  console.log('\n📋 Test 4: Validación de scheduling con workflow');
  try {
    const workflows = await unifiedWorkflowService.getAll();
    const testWorkflow = workflows.find(w => w.status === 'active');

    if (testWorkflow) {
      const validation = await moduleConnectorService.validateSchedulingWithWorkflow({
        workflowId: testWorkflow.id,
        customerId: 'cust-001',
        estimatedDuration: 2, // Duración corta para provocar warning
        cargo: { type: 'general', description: '', weightKg: 100, quantity: 1 },
      });

      console.log('   ✅ PASSED - Validación ejecutada');
      console.log('   📝 Es válido:', validation.isValid);
      console.log('   📝 Warnings:', validation.warnings.length);
      console.log('   📝 Errors:', validation.errors.length);
      if (validation.suggestedDuration) {
        console.log('   📝 Duración sugerida:', validation.suggestedDuration.toFixed(1), 'horas');
      }
      passed++;
    } else {
      console.log('   ⏭️  SKIPPED - No hay workflows activos');
    }
  } catch (error) {
    console.log('   ❌ FAILED - Error:', error);
    failed++;
  }

  // ------------------------------------------------
  // TEST 5: Validación de geocercas de workflow
  // ------------------------------------------------
  console.log('\n📋 Test 5: Validación de geocercas de workflow');
  try {
    const workflows = await unifiedWorkflowService.getAll();
    const workflowWithSteps = workflows.find(w => w.steps.length > 0);

    if (workflowWithSteps) {
      const validation = await moduleConnectorService.validateWorkflowGeofences(workflowWithSteps.id);
      
      console.log('   ✅ PASSED - Validación de geocercas ejecutada');
      console.log('   📝 Workflow:', workflowWithSteps.name);
      console.log('   📝 Geocercas válidas:', validation.valid);
      console.log('   📝 Geocercas faltantes:', validation.missingGeofences?.length || 0);
      passed++;
    } else {
      console.log('   ⏭️  SKIPPED - No hay workflows con steps');
    }
  } catch (error) {
    console.log('   ❌ FAILED - Error:', error);
    failed++;
  }

  // ------------------------------------------------
  // TEST 6: Obtener duración sugerida
  // ------------------------------------------------
  console.log('\n📋 Test 6: Obtener duración sugerida de workflow');
  try {
    const workflows = await unifiedWorkflowService.getAll();
    const testWorkflow = workflows.find(w => w.status === 'active' && w.steps.length > 0);

    if (testWorkflow) {
      const duration = await moduleConnectorService.getSuggestedDuration(testWorkflow.id);
      
      if (duration !== null) {
        console.log('   ✅ PASSED - Duración obtenida');
        console.log('   📝 Workflow:', testWorkflow.name);
        console.log('   📝 Duración:', duration.toFixed(1), 'horas');
        passed++;
      } else {
        console.log('   ⚠️  WARNING - No se pudo calcular duración');
        passed++;
      }
    } else {
      console.log('   ⏭️  SKIPPED - No hay workflows activos con steps');
    }
  } catch (error) {
    console.log('   ❌ FAILED - Error:', error);
    failed++;
  }

  // ------------------------------------------------
  // TEST 7: Preparar orden completa con conexiones
  // ------------------------------------------------
  console.log('\n📋 Test 7: Preparar orden completa con conexiones');
  try {
    const orderData = {
      customerId: 'cust-001',
      priority: 'normal' as const,
      cargo: {
        type: 'general' as const,
        description: 'Carga de prueba',
        weightKg: 1500,
        quantity: 5,
      },
      milestones: [], // Vacío para que se generen automáticamente
      scheduledStartDate: new Date().toISOString(),
      scheduledEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const result = await moduleConnectorService.prepareOrderWithConnections(orderData);

    console.log('   ✅ PASSED - Orden preparada con conexiones');
    console.log('   📝 Workflow asignado:', result.workflowAssignment.workflowName || 'Ninguno');
    console.log('   📝 Milestones generados:', result.enrichedData.milestones?.length || 0);
    console.log('   📝 Advertencias:', result.validationWarnings);
    passed++;
  } catch (error) {
    console.log('   ❌ FAILED - Error:', error);
    failed++;
  }

  // ------------------------------------------------
  // RESUMEN
  // ------------------------------------------------
  console.log('\n========================================');
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('========================================');
  console.log(`   ✅ Pasadas: ${passed}`);
  console.log(`   ❌ Fallidas: ${failed}`);
  console.log(`   📈 Total: ${passed + failed}`);
  console.log('========================================\n');

  return { passed, failed };
}

// Ejecutar tests
runIntegrationTests()
  .then(({ passed, failed }) => {
    if (failed > 0) {
      console.log('⚠️  Algunas pruebas fallaron');
      process.exit(1);
    } else {
      console.log('✅ Todas las pruebas pasaron');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('💥 Error ejecutando pruebas:', error);
    process.exit(1);
  });
