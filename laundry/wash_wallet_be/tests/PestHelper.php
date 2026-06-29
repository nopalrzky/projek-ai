<?php

/**
 * This file is for IDE static analysis only and is not executed.
 * It helps IDEs like VS Code (Intelephense) and PHPStorm resolve the `$this` context
 * in Pest test closures to the base `Tests\TestCase` class.
 */

namespace {

    use Pest\PendingCalls\AfterEachCall;
    use Pest\PendingCalls\BeforeEachCall;
    use Pest\PendingCalls\TestCall;
    use Pest\Support\HigherOrderTapProxy;
    use Tests\TestCase;

    if (false) {
        /**
         * @param-closure-this TestCase $closure
         */
        function beforeEach(?Closure $closure = null): BeforeEachCall
        {
            throw new \Exception();
        }

        /**
         * @param-closure-this TestCase $closure
         */
        function afterEach(?Closure $closure = null): AfterEachCall
        {
            throw new \Exception();
        }

        /**
         * @param-closure-this TestCase $closure
         */
        function test(?string $description = null, ?Closure $closure = null): HigherOrderTapProxy|TestCall
        {
            throw new \Exception();
        }

        /**
         * @param-closure-this TestCase $closure
         */
        function it(string $description, ?Closure $closure = null): TestCall
        {
            throw new \Exception();
        }
    }
}
