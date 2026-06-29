<?php

use function Pest\Laravel\get;
use Inertia\Testing\AssertableInertia as Assert;

describe('Public Legal Pages', function () {

    it('can access /legal/privacy without authentication', function () {
        get('/legal/privacy')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Legal/Privacy')
            );
    });

    it('can access /legal/terms without authentication', function () {
        get('/legal/terms')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Legal/Terms')
            );
    });

    it('can access /legal/account-deletion without authentication', function () {
        get('/legal/account-deletion')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Legal/AccountDeletion')
            );
    });

});
