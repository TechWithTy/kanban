"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockGeneratedLeads } from "../../utils/mocks";

interface LeadDropdownProps {
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string) => void;
}

export function LeadDropdown({
  selectedLeadId,
  setSelectedLeadId,
}: LeadDropdownProps) {
  const selectedLead = mockGeneratedLeads.find(
    (l) => String(l.id) === String(selectedLeadId),
  );

  return (
    <div className="mt-2 grid grid-cols-4 items-center gap-4">
      <label className="col-span-1 font-semibold" htmlFor="lead-select">
        Lead
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="col-span-3"
            id="lead-select"
            aria-haspopup="listbox"
          >
            {selectedLead
              ? `${selectedLead.contactInfo.firstName} ${selectedLead.contactInfo.lastName}`
              : "Select Lead"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {mockGeneratedLeads.map((lead) => (
            <DropdownMenuItem
              key={String(lead.id)}
              onSelect={() => setSelectedLeadId(String(lead.id))}
            >
              {lead.contactInfo.firstName} {lead.contactInfo.lastName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockGeneratedLeads } from "../../utils/mocks";

interface LeadDropdownProps {
  // Lead IDs in mocks are strings, e.g., "lead_1"
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string) => void;
}

export function LeadDropdown({
  selectedLeadId,
  setSelectedLeadId,
}: LeadDropdownProps) {
  const selectedLead = mockGeneratedLeads.find(
    (l) => String(l.id) === String(selectedLeadId),
  );

  return (
    <div className="mt-2 grid grid-cols-4 items-center gap-4">
      <label className="col-span-1 font-semibold" htmlFor="lead-select">
        Lead
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="col-span-3"
            id="lead-select"
            aria-haspopup="listbox"
          >
            {selectedLead
              ? `${selectedLead.contactInfo.firstName} ${selectedLead.contactInfo.lastName}`
              : "Select Lead"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {mockGeneratedLeads.map((lead) => (
            <DropdownMenuItem
              key={String(lead.id)}
              onSelect={() => setSelectedLeadId(String(lead.id))}
            >
              {lead.contactInfo.firstName} {lead.contactInfo.lastName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}