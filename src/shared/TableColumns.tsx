// pages/Facilities.jsx
import { Link } from "react-router-dom";
import { Building2, FileText, Network, Users, Eye } from "lucide-react";
import { Button , Badge } from "../components/UI";
import { Facility } from "../types";


  // Define columns with render functions
  export const Faciltescolumns = [
    {
      label: "Facility Info",
      render: (facility : Facility) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{facility.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{facility.type}</p>
          </div>
        </div>
      )
    },
    {
      label: "Admin Contact",
      render: (facility : Facility) => (
        <>
          <p className="font-medium text-slate-900">{facility.facilityAdminName}</p>
          <p className="text-xs text-slate-500">{facility.phone}</p>
        </>
      )
    },
    {
      label: "Contract Period",
      render: (facility : Facility) => (
        <div className="flex items-center gap-2 text-slate-600">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium">
            {new Date(facility.contractStart).toLocaleDateString()} - {new Date(facility.contractEnd).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      label: "Branches",
      render: (facility : Facility) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <Network className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{facility.totalBranches}</span>
        </div>
      )
    },
    {
      label: "Residents",
      render: (facility : Facility) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{facility.totalResidents}</span>
        </div>
      )
    },
    {
      label: "Status",
      render: (facility : Facility) => (
        <Badge
          variant={
            facility.status === 'Active' ? 'success' :
            facility.status === 'Pending' ? 'warning' : 'danger'
          }
        >
          {facility.status}
        </Badge>
      )
    }
  ];

  // Define actions with render (optional - can also use simple path)
export  const FacilitesActions = [
    {
      render: (facility : Facility) => (
        <Link to={`/owner/facilities/${facility.id}`}>
          <Button variant="ghost" size="sm" icon={Eye}>
            View
          </Button>
        </Link>
      )
    },
    {
      render: (facility : Facility) => (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )
    }
  ];


