<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Requested = 'requested';
    case Cancelled = 'cancelled';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case PickingUp = 'picking_up';
    case Received = 'received';
    case Weighing = 'weighing';
    case ReadyToProcess = 'ready_to_process';
    case InProgress = 'in_progress';
    case Ready = 'ready';
    case Delivering = 'delivering';
    case Delivered = 'delivered';
    case Completed = 'completed';
}
