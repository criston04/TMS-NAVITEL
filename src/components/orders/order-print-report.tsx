"use client";

import type { Order } from "@/types/order";

/**
 * Función para imprimir una orden con su hoja de ruta
 */
export function printOrderReport(order: Order) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("No se pudo abrir la ventana de impresión. Verifica que no esté bloqueada por el navegador.");
    return;
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatShortDate = (date: string) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getMilestoneTypeLabel = (type: string) => {
    const labels = {
      origin: "Origen",
      waypoint: "Punto Intermedio",
      destination: "Destino",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const sortedMilestones = [...order.milestones].sort((a, b) => a.sequence - b.sequence);
  const origin = sortedMilestones.find((m) => m.type === "origin");
  const destination = sortedMilestones.find((m) => m.type === "destination");

  // Generar tabla de programación
  const scheduleTableRows = sortedMilestones
    .map(
      (milestone, index) => `
      <tr>
        <td style="text-align: center; font-weight: 600;">${index + 1}</td>
        <td>
          <div style="font-weight: 600; margin-bottom: 4px;">${milestone.geofenceName}</div>
          <div style="font-size: 12px; color: #6b7280;">${milestone.address}</div>
        </td>
        <td style="text-align: center;">
          <span style="padding: 2px 8px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 12px; font-weight: 600;">
            ${getMilestoneTypeLabel(milestone.type)}
          </span>
        </td>
        <td>${formatShortDate(milestone.estimatedArrival)}</td>
        <td>${milestone.estimatedDeparture ? formatShortDate(milestone.estimatedDeparture) : "—"}</td>
        <td>
          ${milestone.contact ? `<div><strong>${milestone.contact.name}</strong></div><div style="font-size: 12px;">${milestone.contact.phone}</div>` : "—"}
        </td>
      </tr>
    `
    )
    .join("");

  const milestonesHtml = sortedMilestones
    .map(
      (milestone, index) => `
    <div class="milestone">
      <div class="milestone-header">
        <div class="milestone-badge ${milestone.type}">
          ${getMilestoneTypeLabel(milestone.type)}
        </div>
        <div class="milestone-name">
          ${index + 1}. ${milestone.geofenceName}
        </div>
      </div>
      <div class="milestone-details">
        <div class="milestone-detail">
          <strong>Dirección:</strong> ${milestone.address}
        </div>
        <div class="milestone-detail">
          <strong>Hora Programada:</strong> ${formatShortDate(milestone.estimatedArrival)}
        </div>
        <div class="milestone-detail">
          <strong>Coordenadas:</strong> ${milestone.coordinates.lat.toFixed(6)}, ${milestone.coordinates.lng.toFixed(6)}
        </div>
        ${
          milestone.estimatedDeparture
            ? `<div class="milestone-detail">
          <strong>Salida Estimada:</strong> ${formatShortDate(milestone.estimatedDeparture)}
        </div>`
            : ""
        }
        ${
          milestone.contact
            ? `
        <div class="milestone-detail">
          <strong>Contacto:</strong> ${milestone.contact.name}
        </div>
        <div class="milestone-detail">
          <strong>Teléfono:</strong> ${milestone.contact.phone}
        </div>`
            : ""
        }
        ${
          milestone.notes
            ? `<div class="milestone-detail" style="grid-column: 1 / -1">
          <strong>Notas:</strong> ${milestone.notes}
        </div>`
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Orden ${order.orderNumber} - Hoja de Ruta</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20mm;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .header h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 4px;
          }
          .header .subtitle {
            font-size: 14px;
            color: #6b7280;
          }
          .section {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 2px solid #e5e7eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 24px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            font-size: 14px;
            color: #111827;
            font-weight: 500;
          }
          .milestone {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .milestone-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }
          .milestone-badge {
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .milestone-badge.origin {
            background: #dcfce7;
            color: #166534;
          }
          .milestone-badge.waypoint {
            background: #fef3c7;
            color: #92400e;
          }
          .milestone-badge.destination {
            background: #fee2e2;
            color: #991b1b;
          }
          .milestone-name {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
          }
          .milestone-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 8px;
          }
          .milestone-detail {
            font-size: 13px;
            color: #374151;
            display: flex;
            align-items: start;
            gap: 6px;
          }
          .milestone-detail strong {
            color: #6b7280;
            font-weight: 600;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table th,
          table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
          }
          table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
          }
          table td {
            font-size: 13px;
            color: #111827;
          }
          table tbody tr:nth-child(odd) {
            background: #f9fafb;
          }
          table tbody tr:hover {
            background: #f3f4f6;
          }
          @media print {
            body {
              padding: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <h1>Orden de Transporte</h1>
          <div class="subtitle">
            Referencia: ${order.orderNumber} | Fecha de emisión: ${formatDate(order.createdAt)}
          </div>
        </div>

        <!-- Información General -->
        <div class="section">
          <div class="section-title">Información General</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Número de Orden</div>
              <div class="info-value">${order.orderNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estado</div>
              <div class="info-value">${order.status}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Cliente</div>
              <div class="info-value">${order.customer?.name || "—"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tipo de Servicio</div>
              <div class="info-value">${order.serviceType || "—"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Prioridad</div>
              <div class="info-value">${order.priority || "Normal"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Creación</div>
              <div class="info-value">${formatDate(order.createdAt)}</div>
            </div>
          </div>
        </div>

        <!-- Recursos Asignados -->
        <div class="section">
          <div class="section-title">Recursos Asignados</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Conductor</div>
              <div class="info-value">${order.driver?.fullName || "Sin asignar"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Vehículo</div>
              <div class="info-value">
                ${order.vehicle?.plate ? `${order.vehicle.plate} - ${order.vehicle.model || ""}` : "Sin asignar"}
              </div>
            </div>
            ${
              order.driver?.phone
                ? `<div class="info-item">
              <div class="info-label">Teléfono Conductor</div>
              <div class="info-value">${order.driver.phone}</div>
            </div>`
                : ""
            }
          </div>
        </div>

        <!-- PROGRAMACIÓN E ITINERARIO -->
        <div class="section">
          <div class="section-title">Programación e Itinerario de Ruta</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th style="width: 35%;">Lugar / Dirección</th>
                <th style="width: 100px; text-align: center;">Tipo</th>
                <th style="width: 140px;">Llegada Programada</th>
                <th style="width: 140px;">Salida Programada</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              ${scheduleTableRows}
            </tbody>
          </table>
        </div>

        <!-- Información de Carga -->
        ${
          order.cargo
            ? `
        <div class="section">
          <div class="section-title">Información de Carga</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Descripción</div>
              <div class="info-value">${order.cargo.description}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tipo de Carga</div>
              <div class="info-value">${order.cargo.type}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Peso</div>
              <div class="info-value">${order.cargo.weightKg} kg</div>
            </div>
            <div class="info-item">
              <div class="info-label">Cantidad</div>
              <div class="info-value">${order.cargo.quantity} unidades</div>
            </div>
            ${
              order.cargo.volumeM3
                ? `<div class="info-item">
              <div class="info-label">Volumen</div>
              <div class="info-value">${order.cargo.volumeM3} m³</div>
            </div>`
                : ""
            }
            ${
              order.cargo.declaredValue
                ? `<div class="info-item">
              <div class="info-label">Valor Declarado</div>
              <div class="info-value">$${order.cargo.declaredValue} USD</div>
            </div>`
                : ""
            }
          </div>
          ${
            order.cargo.handlingInstructions
              ? `<div class="info-item" style="margin-top: 12px">
            <div class="info-label">Instrucciones de Manejo</div>
            <div class="info-value">${order.cargo.handlingInstructions}</div>
          </div>`
              : ""
          }
        </div>`
            : ""
        }

        <!-- Hoja de Ruta - Puntos de Entrega -->
        <div class="section">
          <div class="section-title">Hoja de Ruta - Puntos de Entrega</div>
          ${milestonesHtml}
        </div>

        <!-- Resumen de Ruta -->
        <div class="section">
          <div class="section-title">Resumen de Ruta</div>
          <table>
            <thead>
              <tr>
                <th>Desde</th>
                <th>Hasta</th>
              </tr>
            </thead>
            <tbody>
              ${
                origin && destination
                  ? `<tr>
                <td>${origin.geofenceName}</td>
                <td>${destination.geofenceName}</td>
              </tr>`
                  : ""
              }
            </tbody>
          </table>
        </div>

        <!-- Notas adicionales -->
        ${
          order.notes
            ? `<div class="section">
          <div class="section-title">Notas Adicionales</div>
          <div class="info-value">${order.notes}</div>
        </div>`
            : ""
        }

        <!-- Footer -->
        <div class="footer">
          <p>Documento generado automáticamente desde TMS-NAVITEL</p>
          <p>Fecha de impresión: ${formatDate(new Date().toISOString())}</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
