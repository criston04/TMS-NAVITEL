"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { VehicleList } from "@/components/fleet/vehicle-list";
import { FleetMap } from "@/components/fleet/fleet-map";
import { Vehicle } from "@/types/fleet";

const mockVehicles: Vehicle[] = [
	{
		id: "1",
		code: "VOL-342808",
		location: { lat: 40.7465, lng: -74.0014 },
		address: "Chelsea",
		city: "NY",
		country: "USA",
		progress: 88,
		driver: "Veronica Herman",
		status: "en-ruta",
		tracking: [
			{
				id: "t1",
				status: "completed",
				title: "TRACKING NUMBER CREATED",
				description: "",
				timestamp: "Sep 01, 7:53 AM",
				handler: "Veronica Herman",
			},
			{
				id: "t2",
				status: "completed",
				title: "OUT FOR DELIVERY",
				description: "",
				timestamp: "Sep 03, 8:02 AM",
				handler: "Veronica Herman",
			},
			{
				id: "t3",
				status: "current",
				title: "ARRIVED",
				description: "",
				timestamp: "Sep 03, 8:02 AM",
				handler: "Helen Jacobs",
			},
			{
				id: "t4",
				status: "pending",
				title: "DELIVERED",
				description: "",
				timestamp: "Pending",
			},
		],
	},
	{
		id: "2",
		code: "VOL-954784",
		location: { lat: 40.7614, lng: -74.0253 },
		address: "Lincoln Harbor",
		city: "NY",
		country: "USA",
		progress: 45,
		driver: "Michael Chen",
		status: "en-ruta",
		tracking: [
			{
				id: "t1",
				status: "completed",
				title: "TRACKING NUMBER CREATED",
				description: "",
				timestamp: "Sep 02, 9:00 AM",
				handler: "Sarah Wilson",
			},
			{
				id: "t2",
				status: "current",
				title: "OUT FOR DELIVERY",
				description: "",
				timestamp: "Sep 03, 7:30 AM",
				handler: "Michael Chen",
			},
			{
				id: "t3",
				status: "pending",
				title: "ARRIVED",
				description: "",
				timestamp: "Pending",
			},
		],
	},
	{
		id: "3",
		code: "VOL-342808",
		location: { lat: 40.7549, lng: -73.9724 },
		address: "Midtown East",
		city: "NY",
		country: "USA",
		progress: 100,
		driver: "James Rodriguez",
		status: "completado",
		tracking: [
			{
				id: "t1",
				status: "completed",
				title: "TRACKING NUMBER CREATED",
				description: "",
				timestamp: "Sep 01, 6:00 AM",
				handler: "Emily Davis",
			},
			{
				id: "t2",
				status: "completed",
				title: "OUT FOR DELIVERY",
				description: "",
				timestamp: "Sep 01, 8:00 AM",
				handler: "James Rodriguez",
			},
			{
				id: "t3",
				status: "completed",
				title: "ARRIVED",
				description: "",
				timestamp: "Sep 01, 11:30 AM",
				handler: "James Rodriguez",
			},
			{
				id: "t4",
				status: "completed",
				title: "DELIVERED",
				description: "",
				timestamp: "Sep 01, 11:45 AM",
				handler: "James Rodriguez",
			},
		],
	},
	{
		id: "4",
		code: "VOL-678234",
		location: { lat: 40.7282, lng: -74.0776 },
		address: "Hoboken",
		city: "NJ",
		country: "USA",
		progress: 65,
		driver: "David Kim",
		status: "entregando",
		tracking: [
			{
				id: "t1",
				status: "completed",
				title: "TRACKING NUMBER CREATED",
				description: "",
				timestamp: "Sep 03, 6:00 AM",
				handler: "Lisa Park",
			},
			{
				id: "t2",
				status: "current",
				title: "OUT FOR DELIVERY",
				description: "",
				timestamp: "Sep 03, 9:00 AM",
				handler: "David Kim",
			},
		],
	},
	{
		id: "5",
		code: "VOL-891456",
		location: { lat: 40.7831, lng: -73.9712 },
		address: "Upper East Side",
		city: "NY",
		country: "USA",
		progress: 30,
		driver: "Anna Martinez",
		status: "en-ruta",
		tracking: [
			{
				id: "t1",
				status: "completed",
				title: "TRACKING NUMBER CREATED",
				description: "",
				timestamp: "Sep 02, 2:00 PM",
				handler: "Robert Brown",
			},
			{
				id: "t2",
				status: "current",
				title: "OUT FOR DELIVERY",
				description: "",
				timestamp: "Sep 03, 7:00 AM",
				handler: "Anna Martinez",
			},
		],
	},
];

export default function FleetPage() {
	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
		mockVehicles[0]
	);

	return (
		<div className="h-[calc(100vh-7rem)] animate-fade-in">
			<Card className="h-full overflow-hidden">
				<div className="flex h-full">
					<div className="w-[420px] border-r flex-shrink-0 bg-card">
						<VehicleList
							vehicles={mockVehicles}
							selectedVehicle={selectedVehicle}
							onSelectVehicle={setSelectedVehicle}
						/>
					</div>
					<div className="flex-1 relative">
						<FleetMap
							vehicles={mockVehicles}
							selectedVehicle={selectedVehicle}
							onSelectVehicle={setSelectedVehicle}
							className="h-full"
						/>
					</div>
				</div>
			</Card>
		</div>
	);
}
