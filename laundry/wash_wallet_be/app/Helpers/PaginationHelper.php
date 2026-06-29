<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PaginationHelper
{
  public static function format(LengthAwarePaginator $paginator, Request $request): array
  {
    return [
      'currentPage' => $paginator->currentPage(),
      'from' => $paginator->firstItem(),
      'lastPage' => $paginator->lastPage(),
      'perPage' => $paginator->perPage(),
      'to' => $paginator->lastItem(),
      'total' => $paginator->total(),
      'path' => $request->url(),
      'firstPageUrl' => $paginator->url(1),
      'lastPageUrl' => $paginator->url($paginator->lastPage()),
      'nextPageUrl' => $paginator->nextPageUrl(),
      'prevPageUrl' => $paginator->previousPageUrl(),
    ];
  }
}
