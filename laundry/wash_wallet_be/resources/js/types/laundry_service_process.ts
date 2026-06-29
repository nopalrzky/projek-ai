import { LaundryService, Process } from ".";

export interface LaundryServiceProcess {
    id: number;
    laundryServiceId: number;
    processId: number;
    sequence: number;
    process: Process;
    laundryService: LaundryService;
    createdAt: string;
    updatedAt: string;
}
