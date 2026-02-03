/**
 * @fileoverview Página principal de Monitoreo - Redirige a Torre de Control
 * @module app/(dashboard)/monitoring/page
 */

import { redirect } from "next/navigation";

export default function MonitoringPage() {
  redirect("/monitoring/control-tower");
}
