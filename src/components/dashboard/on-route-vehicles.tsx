"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const vehicles = [
  { id: "VOL-468031", start: "Cagnes-sur-Mer, France", end: "Catania, Italy", warning: "No Warnings", progress: 49 },
  { id: "VOL-302781", start: "Köln, Germany", end: "Laspezia, Italy", warning: "Ecu Not Responding", progress: 24, warningColor: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
  { id: "VOL-715822", start: "Chambray-lès-Tours, France", end: "Hamm, Germany", warning: "Oil Leakage", progress: 7, warningColor: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400" },
  { id: "VOL-451430", start: "Berlin, Germany", end: "Gelsenkirchen, Germany", warning: "No Warnings", progress: 95 },
  { id: "VOL-921577", start: "Cergy-Pontoise, France", end: "Berlin, Germany", warning: "No Warnings", progress: 65 },
];

export function OnRouteVehicles() {
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">On route vehicles</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md">
            <div className="grid grid-cols-[30px_50px_1fr_1.5fr_1.5fr_1fr_1.5fr] gap-4 py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                <div></div>
                <div></div>
                <div>Location</div>
                <div>Starting Route</div>
                <div>Ending Route</div>
                <div>Warnings</div>
                <div>Progress</div>
            </div>
            
            <div className="divide-y">
            {vehicles.map((v) => (
                <div key={v.id} className="grid grid-cols-[30px_50px_1fr_1.5fr_1.5fr_1fr_1.5fr] gap-4 py-4 px-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center">
                        <Checkbox className="rounded-sm border-slate-300" />
                    </div>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <Truck className="h-4 w-4" />
                    </div>
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{v.id}</div>
                    <div className="text-sm text-slate-500">{v.start}</div>
                    <div className="text-sm text-slate-500">{v.end}</div>
                    <div>
                         {/* Custom Badge style */}
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${v.warningColor || 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                            {v.warning}
                         </span>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${v.progress}%` }}></div>
                         </div>
                         <span className="text-xs font-medium text-slate-500 w-8 text-right">{v.progress}%</span>
                    </div>
                </div>
            ))}
            </div>

            {/* Pagination Mock */}
            <div className="flex items-center justify-between pt-6 px-4">
                <span className="text-sm text-muted-foreground">Showing 1 to 5 of 25 entries</span>
                <div className="flex items-center gap-1">
                     <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800"><span className="text-xs">|&lt;</span></Button>
                     <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800"><span className="text-xs">&lt;</span></Button>
                     <Button variant="default" size="icon" className="h-8 w-8 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"><span className="text-xs">1</span></Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md"><span className="text-xs">2</span></Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md"><span className="text-xs">3</span></Button>
                     <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800"><span className="text-xs">&gt;</span></Button>
                     <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800"><span className="text-xs">&gt;|</span></Button>
                </div>
            </div>

        </div>
      </CardContent>
    </Card>
  );
}
