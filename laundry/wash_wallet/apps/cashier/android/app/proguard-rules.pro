# SLF4J checks for this optional binding at runtime. Some transitive Android
# dependencies reference it, but the app does not need to package a binding.
-dontwarn org.slf4j.impl.StaticLoggerBinder
