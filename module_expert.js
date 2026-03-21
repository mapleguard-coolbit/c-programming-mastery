const ModuleExpert = {
    description: "The complete expert track: variadic functions, deep string mastery, time handling, signal handling — plus the C23/C11 frontier: type-generic programming with _Generic, auto and typeof, non-local jumps, unreachable(), threads, and restrict/inline performance.",

    lessons: [
        {
            id: "variadic-functions",
            title: "Variadic Functions",
            explanation: "You've called <code>printf</code> with one argument, two arguments, ten arguments — it always works. That's because <code>printf</code> is a <strong>variadic function</strong>: a function that accepts a variable number of arguments. The mechanism that makes this possible is exposed through <code>&lt;stdarg.h&gt;</code>, and you can write your own variadic functions using it. Understanding this unlocks a whole class of utility functions: logging, formatting, dispatchers.",
            sections: [
                {
                    title: "The Ellipsis and va_list",
                    content: "A variadic function is declared with a normal fixed parameter list followed by <code>...</code> (an ellipsis). At least one fixed parameter is required — it's usually the format string or a count that tells the function how many extra arguments to expect. Inside the function, you use four macros from <code>&lt;stdarg.h&gt;</code> to access the variable arguments.",
                    points: [
                        "<code>va_list ap</code>: Declare a variable of type <code>va_list</code> to hold the state of the argument traversal.",
                        "<code>va_start(ap, last_fixed)</code>: Initialize the <code>va_list</code>. Pass the name of the last fixed parameter — the macro uses it to find where the variable arguments start. Call this before the first <code>va_arg</code>. In C23, the second argument is optional.",
                        "<code>va_arg(ap, type)</code>: Retrieve the next argument. You must specify the type you expect — the function has no type information about its extra arguments at runtime. Getting the type wrong is undefined behavior.",
                        "<code>va_end(ap)</code>: Clean up the <code>va_list</code> when you're done. Always call this before returning from the function.",
                        "<code>va_copy(dest, src)</code>: Copy a <code>va_list</code> so you can traverse the arguments twice without restarting."
                    ],
                    code: `#include <stdio.h>
#include <stdarg.h>

// Sum an arbitrary number of ints.
// 'count' tells us how many to expect.
int sumInts(int count, ...) {
    va_list ap;
    va_start(ap, count); // Initialize after 'count'
    
    int total = 0;
    for (int i = 0; i < count; i++) {
        total += va_arg(ap, int); // Fetch next int
    }
    
    va_end(ap);
    return total;
}

int main(void) {
    printf("sum(1,2,3):          %d\\n", sumInts(3, 1, 2, 3));
    printf("sum(10,20,30,40,50): %d\\n", sumInts(5, 10, 20, 30, 40, 50));
    return 0;
}`,
                    output: "sum(1,2,3):          6\nsum(10,20,30,40,50): 150"
                },
                {
                    title: "A Practical Example: Custom Logger",
                    content: "The most common real-world use of variadic functions is building wrappers around <code>printf</code>-family functions. The <code>vprintf</code>, <code>vfprintf</code>, and <code>vsprintf</code> variants accept a <code>va_list</code> instead of <code>...</code>, so you can forward your variable arguments to them without re-implementing formatting.",
                    code: `#include <stdio.h>
#include <stdarg.h>

typedef enum { LOG_INFO, LOG_WARN, LOG_ERROR } LogLevel;

void logMessage(LogLevel level, const char *fmt, ...) {
    const char *prefix;
    switch (level) {
        case LOG_INFO:  prefix = "INFO";  break;
        case LOG_WARN:  prefix = "WARN";  break;
        case LOG_ERROR: prefix = "ERROR"; break;
        default:        prefix = "???";
    }
    
    printf("[%s] ", prefix);
    
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap); // Forward to vprintf -- no reformatting needed
    va_end(ap);
    
    printf("\\n");
}

int main(void) {
    logMessage(LOG_INFO,  "Server started on port %d", 8080);
    logMessage(LOG_WARN,  "Memory usage at %d%%", 85);
    logMessage(LOG_ERROR, "Failed to open file: %s", "config.txt");
    return 0;
}`,
                    output: "[INFO] Server started on port 8080\n[WARN] Memory usage at 85%\n[ERROR] Failed to open file: config.txt",
                    tip: "The <code>v</code>-prefixed functions (<code>vprintf</code>, <code>vfprintf</code>, <code>vsprintf</code>, <code>vsnprintf</code>) exist specifically to enable this pattern. Whenever you write a variadic function that ultimately wants to produce formatted output, use <code>vprintf</code> and friends — don't try to process the format string yourself."
                },
                {
                    title: "The Sentinel Pattern",
                    content: "An alternative to a count parameter is a sentinel value — a special argument value that signals 'no more arguments'. A common example: a function that takes a variable number of strings and uses NULL as the terminator.",
                    code: `#include <stdio.h>
#include <stdarg.h>

// Concatenate and print strings. Call with a NULL sentinel at the end.
void printAll(const char *first, ...) {
    va_list ap;
    va_start(ap, first);
    
    for (const char *s = first; s != NULL; s = va_arg(ap, const char*)) {
        printf("%s", s);
    }
    printf("\\n");
    
    va_end(ap);
}

int main(void) {
    printAll("Hello", ", ", "World", "!", NULL);
    printAll("One", " two", " three", NULL);
    return 0;
}`,
                    output: "Hello, World!\nOne two three",
                    warning: "There is no way for a variadic function to know how many arguments were passed, or what their types are, without external information. The function is completely dependent on the caller providing accurate information (via the format string, or a count, or a sentinel). If the caller lies or makes a mistake — passing the wrong number, the wrong type, or forgetting the sentinel — the behavior is undefined. This is why printf format string mismatches are real bugs."
                }
            ]
        },
        {
            id: "string-deep",
            title: "Deeper String Functions",
            explanation: "The curriculum covered the basics of <code>&lt;string.h&gt;</code> — <code>strlen</code>, <code>strcpy</code>, <code>strcat</code>, <code>strcmp</code>. But the header contains many more functions for searching, splitting, and duplicating strings. These come up constantly in text processing and input parsing, and not knowing them leads to reimplementing them badly from scratch.",
            sections: [
                {
                    title: "Searching Strings",
                    content: "The search functions return pointers into the original string rather than indices. This means you can use the returned pointer directly for further operations — print from there, copy from there, or use pointer arithmetic to compute the position.",
                    points: [
                        "<code>strchr(str, c)</code>: Find the first occurrence of character <code>c</code> in <code>str</code>. Returns a pointer to that character, or NULL if not found.",
                        "<code>strrchr(str, c)</code>: Find the <em>last</em> occurrence of character <code>c</code>. Useful for finding the file extension or directory separator in a path.",
                        "<code>strstr(haystack, needle)</code>: Find the first occurrence of the substring <code>needle</code> in <code>haystack</code>. Returns a pointer to the start of the match, or NULL. Case-sensitive."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

int main(void) {
    const char *path = "/home/user/documents/report.pdf";
    
    // Find last '/' to get filename
    const char *filename = strrchr(path, '/');
    if (filename) filename++; // Skip the '/' itself
    printf("Filename: %s\\n", filename); // report.pdf
    
    // Find '.' to get extension
    const char *ext = strrchr(filename, '.');
    if (ext) ext++; // Skip the '.'
    printf("Extension: %s\\n", ext); // pdf
    
    // Search for substring
    const char *haystack = "The quick brown fox jumps";
    const char *found = strstr(haystack, "brown");
    if (found) {
        printf("Found 'brown' at offset %td\\n", found - haystack);
    }
    
    // strchr: find first '/'
    const char *slash = strchr(path, '/');
    printf("First slash at offset %td\\n", slash - path);
    
    return 0;
}`,
                    output: "Filename: report.pdf\nExtension: pdf\nFound 'brown' at offset 10\nFirst slash at offset 0"
                },
                {
                    title: "Splitting Strings: strtok",
                    content: "<code>strtok</code> splits a string into tokens separated by delimiter characters. The first call passes the string; subsequent calls for the same string pass NULL. It works by replacing each delimiter it finds with a null terminator and returning a pointer to the start of the current token. This means it modifies the original string in place — never use it on a string literal.",
                    points: [
                        "<strong>First call</strong>: <code>strtok(str, delimiters)</code> — pass the string to tokenize.",
                        "<strong>Subsequent calls</strong>: <code>strtok(NULL, delimiters)</code> — pass NULL to continue where you left off.",
                        "<strong>Returns NULL when done</strong>: When no more tokens exist, strtok returns NULL.",
                        "<strong>Not reentrant</strong>: <code>strtok</code> uses static internal state, so you can't tokenize two strings simultaneously. For that, use the safer <code>strtok_r</code> (POSIX) or <code>strtok_s</code> (C11)."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

int main(void) {
    // strtok MODIFIES the string -- copy it first if you need the original
    char csv[] = "Alice,30,Engineer,New York";
    
    printf("Fields:\\n");
    char *token = strtok(csv, ","); // First call: pass the string
    while (token != NULL) {
        printf("  '%s'\\n", token);
        token = strtok(NULL, ","); // Subsequent calls: pass NULL
    }
    
    // Tokenizing with multiple delimiter characters
    char sentence[] = "one  two\\tthree\\nfour";
    printf("\\nWords (splitting on space/tab/newline):\\n");
    token = strtok(sentence, " \\t\\n");
    while (token != NULL) {
        printf("  '%s'\\n", token);
        token = strtok(NULL, " \\t\\n");
    }
    
    return 0;
}`,
                    output: "Fields:\n  'Alice'\n  '30'\n  'Engineer'\n  'New York'\n\nWords (splitting on space/tab/newline):\n  'one'\n  'two'\n  'three'\n  'four'"
                },
                {
                    title: "Duplicating Strings: strdup (now standard in C23)",
                    content: "<code>strdup</code> allocates heap memory, copies the string into it, and returns the pointer. It's been a POSIX extension for decades and is now part of standard C23. Since it allocates heap memory, you're responsible for calling <code>free</code> on the result.",
                    points: [
                        "<code>strdup(s)</code>: Duplicate a full string. Returns a heap-allocated copy.",
                        "<code>strndup(s, n)</code>: Duplicate at most <code>n</code> characters of <code>s</code>. A null terminator is always added. Useful for safely copying a substring.",
                        "<strong>Why use it?</strong>: When a function receives a string pointer, it only has a temporary view — the caller may free or modify it. Calling <code>strdup</code> gives the function its own permanent copy it fully owns."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Function that takes ownership: needs its own copy
char *makeTitle(const char *str) {
    char *copy = strdup(str); // Heap-allocate a copy (C23 standard)
    if (!copy) return NULL;
    
    if (copy[0] >= 'a' && copy[0] <= 'z') copy[0] -= 32;
    return copy; // Caller is responsible for free()
}

int main(void) {
    const char *original = "hello, world";
    
    char *titled = makeTitle(original);
    printf("Original: %s\\n", original); // Unchanged
    printf("Titled:   %s\\n", titled);
    free(titled);
    
    // strndup: copy only first 5 chars
    char *partial = strndup("hello world", 5);
    printf("Partial:  %s\\n", partial); // "hello"
    free(partial);
    
    return 0;
}`,
                    output: "Original: hello, world\nTitled:   Hello, world\nPartial:  hello"
                }
            ]
        },
        {
            id: "time",
            title: "Date and Time with <time.h>",
            explanation: "Programs frequently need to measure elapsed time, timestamp events, display the current date, or calculate time differences. <code>&lt;time.h&gt;</code> provides the core types and functions for all of these. The key is understanding the three representations C uses internally and how to convert between them.",
            sections: [
                {
                    title: "The Three Time Types",
                    content: "C represents time in three ways, each useful in different contexts.",
                    points: [
                        "<code>time_t</code>: A single number — seconds elapsed since January 1, 1970, 00:00:00 UTC (the Unix epoch). Platform-dependent size but usually 64 bits now. Good for timestamps, durations, and comparison.",
                        "<code>struct tm</code>: A human-readable breakdown — separate fields for year, month, day, hour, minute, second, day of week, etc. Good for formatting dates and doing calendar arithmetic.",
                        "<code>clock_t</code>: CPU clock ticks consumed by the current process. Used for measuring execution time of code sections. Divide by <code>CLOCKS_PER_SEC</code> to get seconds."
                    ],
                    code: `#include <stdio.h>
#include <time.h>

int main(void) {
    time_t now = time(NULL);
    printf("Unix timestamp: %lld\\n", (long long)now);
    
    struct tm *local = localtime(&now);
    printf("Year:  %d\\n", local->tm_year + 1900); // tm_year is years since 1900
    printf("Month: %d\\n", local->tm_mon + 1);     // tm_mon is 0-indexed
    printf("Day:   %d\\n", local->tm_mday);
    printf("Hour:  %d\\n", local->tm_hour);
    printf("Min:   %d\\n", local->tm_min);
    
    struct tm *utc = gmtime(&now);
    printf("UTC hour: %d\\n", utc->tm_hour);
    
    return 0;
}`,
                    output: "Unix timestamp: 1735689600\nYear:  2025\nMonth: 1\nDay:   1\nHour:  12\nMin:   0\nUTC hour: 7"
                },
                {
                    title: "Formatting Dates: strftime",
                    content: "<code>strftime</code> formats a <code>struct tm</code> into a string using format codes similar to <code>printf</code>. It writes at most <code>n-1</code> characters into the buffer and always null-terminates.",
                    code: `#include <stdio.h>
#include <time.h>

int main(void) {
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    char buf[100];
    
    strftime(buf, sizeof(buf), "%A, %B %d, %Y", t);
    printf("%s\\n", buf);    // Wednesday, January 01, 2025
    
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", t);
    printf("%s\\n", buf);    // 2025-01-01 12:00:00
    
    strftime(buf, sizeof(buf), "%I:%M %p", t);
    printf("%s\\n", buf);    // 12:00 PM
    
    return 0;
}`,
                    output: "Wednesday, January 01, 2025\n2025-01-01 12:00:00\n12:00 PM",
                    tip: "Common format codes: <code>%Y</code> 4-digit year, <code>%m</code> month (01–12), <code>%d</code> day (01–31), <code>%H</code> hour 24h (00–23), <code>%I</code> hour 12h (01–12), <code>%M</code> minute, <code>%S</code> second, <code>%A</code> full weekday name, <code>%B</code> full month name, <code>%p</code> AM/PM."
                },
                {
                    title: "Measuring Elapsed Time",
                    content: "Two techniques for timing: <code>difftime</code> gives the difference between two <code>time_t</code> values in seconds. <code>clock</code> gives CPU time consumed, with sub-second precision. C11 adds <code>timespec_get</code> for nanosecond-resolution wall-clock time.",
                    code: `#include <stdio.h>
#include <time.h>
#include <math.h>

int main(void) {
    clock_t start = clock();
    
    volatile double result = 0;
    for (int i = 0; i < 10000000; i++) {
        result += sqrt((double)i);
    }
    
    clock_t end = clock();
    double cpu_elapsed = (double)(end - start) / CLOCKS_PER_SEC;
    printf("CPU time: %.3f seconds\\n", cpu_elapsed);
    printf("Result:   %.0f\\n", result);
    
    // C11: nanosecond wall-clock time
    struct timespec ts_start, ts_end;
    timespec_get(&ts_start, TIME_UTC);
    // ... work ...
    timespec_get(&ts_end, TIME_UTC);
    double wall = (ts_end.tv_sec - ts_start.tv_sec) +
                  (ts_end.tv_nsec - ts_start.tv_nsec) * 1e-9;
    printf("Wall time: %.9f seconds\\n", wall);
    
    return 0;
}`,
                    output: "CPU time: 0.087 seconds\nResult:   21081851083\nWall time: 0.000000100 seconds",
                    tip: "<code>clock()</code> measures CPU time, not wall-clock time. If your program sleeps or waits for I/O, CPU time will be less than wall time. For benchmarking code, <code>clock()</code> is usually what you want. For user-visible timing (how long did this download take?), use <code>timespec_get</code> or <code>time()</code>."
                }
            ]
        },
        {
            id: "signal-handling",
            title: "Signal Handling",
            explanation: "Signals are asynchronous notifications sent to a process by the OS, by the hardware, or by another process. Pressing Ctrl+C sends SIGINT to the foreground process. Dividing by zero generates SIGFPE. Dereferencing a NULL pointer generates SIGSEGV. By default, most signals kill the process. You can install a handler function to intercept signals and respond — for example, cleaning up resources before exit when the user presses Ctrl+C.",
            sections: [
                {
                    title: "The signal() Function",
                    content: "The <code>signal()</code> function from <code>&lt;signal.h&gt;</code> installs a handler for a given signal. The handler is a function that takes the signal number as its argument. Two special values can be passed instead of a function: <code>SIG_IGN</code> to ignore the signal, and <code>SIG_DFL</code> to restore the default behavior.",
                    points: [
                        "<code>SIGINT</code>: Interrupt — sent by Ctrl+C. The standard 'user wants to stop this'.",
                        "<code>SIGTERM</code>: Termination request — sent by the <code>kill</code> command. The polite way to ask a process to exit.",
                        "<code>SIGFPE</code>: Floating point exception — arithmetic errors like integer division by zero.",
                        "<code>SIGSEGV</code>: Segmentation violation — invalid memory access (NULL dereference, buffer overflow, etc.).",
                        "<code>SIGABRT</code>: Abort — sent by <code>abort()</code>.",
                        "<code>SIGALRM</code>: Alarm clock — sent after a timeout set with <code>alarm()</code>."
                    ],
                    code: `#include <stdio.h>
#include <signal.h>
#include <stdlib.h>

void handleSigint(int sig) {
    printf("\\nCaught signal %d (SIGINT)\\n", sig);
    printf("Cleaning up and exiting gracefully...\\n");
    exit(0);
}

int main(void) {
    signal(SIGINT, handleSigint);
    
    printf("Running. Press Ctrl+C to stop.\\n");
    
    for (int i = 0; i < 6; i++) {
        printf("Working... %d\\r", i);
        fflush(stdout);
    }
    
    printf("\\nDone normally.\\n");
    return 0;
}`,
                    output: "Running. Press Ctrl+C to stop.\nWorking... 5\nDone normally."
                },
                {
                    title: "What You Can Safely Do in a Signal Handler",
                    content: "Signal handlers are called asynchronously — they can interrupt any point in your program, including the middle of a <code>malloc</code> call or a <code>printf</code>. This means most library functions are unsafe to call from a signal handler. The correct pattern is to set a flag and let the main loop react.",
                    points: [
                        "<strong>Safe</strong>: Setting a global <code>volatile sig_atomic_t</code> flag variable and returning.",
                        "<strong>Unsafe</strong>: Calling <code>printf</code>, <code>malloc</code>, <code>free</code>, or most other library functions from inside the handler.",
                        "<strong>volatile sig_atomic_t</strong>: The correct type for a flag shared between the main program and a signal handler. <code>sig_atomic_t</code> is guaranteed to be read and written atomically. <code>volatile</code> prevents the compiler from caching its value in a register."
                    ],
                    code: `#include <stdio.h>
#include <signal.h>
#include <stdlib.h>

volatile sig_atomic_t running = 1;

void handleSigint(int sig) {
    (void)sig;
    running = 0;  // Just set the flag -- nothing else is safe here
}

int main(void) {
    signal(SIGINT, handleSigint);
    
    printf("Press Ctrl+C to stop.\\n");
    
    int ticks = 0;
    while (running) {
        printf("Tick\\n");
        if (++ticks >= 3) running = 0; // Demo: stop after 3
    }
    
    // Safe to do cleanup outside the handler
    printf("Caught signal -- cleaning up.\\n");
    return 0;
}`,
                    output: "Press Ctrl+C to stop.\nTick\nTick\nTick\nCaught signal -- cleaning up.",
                    warning: "The <code>signal()</code> function is portable but limited. On Unix-like systems, <code>sigaction()</code> is the recommended alternative — it provides more control, more reliable semantics, and the ability to block signals during handler execution. Use <code>signal()</code> for portability; use <code>sigaction()</code> for production Unix code."
                }
            ]
        },
        {
            id: "generic-selection",
            title: "Type-Generic Programming with _Generic",
            explanation: "C11 introduced <code>_Generic</code> — a compile-time construct that selects an expression based on the type of a controlling expression. It's the foundation of type-generic programming in C: the mechanism behind <code>&lt;tgmath.h&gt;</code>, and a tool for writing macros that behave correctly regardless of input type.",
            sections: [
                {
                    title: "The _Generic Expression",
                    content: "A <code>_Generic</code> expression evaluates the type of a controlling expression at compile time — not its value — and selects one branch from a list. The unselected branches are not evaluated. This is purely a compile-time dispatch mechanism.",
                    code: `#include <stdio.h>
#include <math.h>

// Type-generic absolute value — dispatches to the right function
#define myabs(X) _Generic((X),   \\
    int:          abs,           \\
    long:         labs,          \\
    long long:    llabs,         \\
    float:        fabsf,         \\
    double:       fabs,          \\
    long double:  fabsl          \\
)(X)

#define type_name(X) _Generic((X), \\
    int:    "int",                 \\
    double: "double",              \\
    float:  "float",               \\
    long:   "long",                \\
    default:"other"               \\
)

int main(void) {
    printf("myabs(-5)    = %d   (%s)\\n", myabs(-5),    type_name(-5));
    printf("myabs(-3.14) = %f (%s)\\n",  myabs(-3.14), type_name(-3.14));
    printf("myabs(-2.7f) = %f  (%s)\\n", myabs(-2.7f), type_name(-2.7f));
    return 0;
}`,
                    output: `myabs(-5)    = 5   (int)
myabs(-3.14) = 3.140000 (double)
myabs(-2.7f) = 2.700000  (float)`
                },
                {
                    title: "Selecting Function Pointers and <tgmath.h>",
                    content: "The most powerful pattern selects a function pointer and calls it immediately. This is exactly how <code>&lt;tgmath.h&gt;</code> dispatches <code>sqrt</code> to <code>sqrtf</code>, <code>sqrt</code>, or <code>sqrtl</code> based on argument type.",
                    code: `#include <stdio.h>
#include <math.h>

#define SQRT(X) _Generic((X),    \\
    float:       sqrtf,          \\
    long double: sqrtl,          \\
    default:     sqrt            \\
)((X))

static inline int   imin(int a, int b)       { return a < b ? a : b; }
static inline float fminf_g(float a, float b){ return a < b ? a : b; }
static inline double dmin(double a, double b){ return a < b ? a : b; }

#define MIN(a, b) _Generic((a)+(b), \\
    float:   fminf_g,              \\
    double:  dmin,                 \\
    default: imin                  \\
)((a), (b))

int main(void) {
    printf("SQRT(2.0f) = %f (sqrtf)\\n", SQRT(2.0f));
    printf("SQRT(2.0)  = %f (sqrt)\\n",  SQRT(2.0));
    printf("MIN(3, 5)  = %d\\n",          MIN(3, 5));
    printf("MIN(1.5,2.5) = %f\\n",        MIN(1.5, 2.5));
    return 0;
}`,
                    output: `SQRT(2.0f) = 1.414214 (sqrtf)
SQRT(2.0)  = 1.414214 (sqrt)
MIN(3, 5)  = 3
MIN(1.5,2.5) = 1.500000`,
                    tip: "Include <code>&lt;tgmath.h&gt;</code> instead of <code>&lt;math.h&gt;</code> when you want automatic type dispatch on all math functions. You write <code>sqrt</code> everywhere and the compiler picks <code>sqrtf</code>, <code>sqrt</code>, or <code>sqrtl</code> based on argument type — no more forgetting the <code>f</code> suffix."
                }
            ]
        },
        {
            id: "auto-typeof",
            title: "C23 Type Inference: auto and typeof",
            explanation: "C23 introduces two major type-inference features: <code>auto</code> for deducing variable types from their initializers, and <code>typeof</code> / <code>typeof_unqual</code> for querying the type of an expression at compile time without evaluating it. Together they make type-generic macros dramatically safer and more composable.",
            sections: [
                {
                    title: "auto: Type Deduction (C23)",
                    content: "In C23, <code>auto</code> deduces the type of a variable from its initializer. The variable gets the exact type of the initializer — no implicit conversions. Useful for complex types and generic macros.",
                    code: `#include <stdio.h>

int main(void) {
    auto x = 42;       // int
    auto y = 3.14;     // double
    auto z = 3.14f;    // float
    auto p = &x;       // int*

    printf("x=%d, y=%f, z=%f, *p=%d\\n", x, y, z, *p);

    auto factorial = 1ULL;
    for (auto i = 1; i <= 10; i++) {
        factorial *= (unsigned long long)i;
    }
    printf("10! = %llu\\n", factorial);
    return 0;
}`,
                    output: "x=42, y=3.140000, z=3.140000, *p=42\n10! = 3628800",
                    warning: "<code>auto</code> in C23 requires an initializer and cannot be used for function parameters or return types."
                },
                {
                    title: "typeof and typeof_unqual (C23)",
                    content: "<code>typeof(expr)</code> gives the compile-time type of an expression without evaluating it. <code>typeof_unqual</code> gives the same type but strips <code>const</code>/<code>volatile</code>. Invaluable in macros for declaring temporaries of the right type.",
                    code: `#include <stdio.h>

// Safe swap: evaluates each argument exactly once
#define SWAP(A, B)              \\
    do {                        \\
        typeof(A) _tmp = (A);   \\
        (A) = (B);              \\
        (B) = _tmp;             \\
    } while (0)

// Clamp — works for any comparable type
#define CLAMP(val, lo, hi)                       \\
    ({                                           \\
        typeof(val) _v  = (val);                \\
        typeof(val) _lo = (lo);                 \\
        typeof(val) _hi = (hi);                 \\
        _v < _lo ? _lo : (_v > _hi ? _hi : _v); \\
    })

int main(void) {
    int a = 5, b = 10;
    SWAP(a, b);
    printf("After SWAP: a=%d, b=%d\\n", a, b);

    double x = 3.7, y = 2.1;
    SWAP(x, y);
    printf("After SWAP: x=%f, y=%f\\n", x, y);

    printf("CLAMP(15, 0, 10) = %d\\n", CLAMP(15, 0, 10));
    printf("CLAMP(15.5, 0.0, 10.0) = %f\\n", CLAMP(15.5, 0.0, 10.0));

    // typeof_unqual: strip const
    const int ci = 100;
    typeof_unqual(ci) mutable_copy = ci;
    mutable_copy = 200;
    printf("mutable_copy = %d\\n", mutable_copy);
    return 0;
}`,
                    output: "After SWAP: a=10, b=5\nAfter SWAP: x=2.100000, y=3.700000\nCLAMP(15, 0, 10) = 10\nCLAMP(15.5, 0.0, 10.0) = 10.000000\nmutable_copy = 200"
                }
            ]
        },
        {
            id: "setjmp-longjmp",
            title: "Non-Local Jumps: setjmp and longjmp",
            explanation: "C provides a mechanism for jumping out of deeply nested function calls without the normal return path: <code>setjmp</code> saves the current execution state into a <code>jmp_buf</code>, and <code>longjmp</code> restores it from anywhere in the call stack. This is C's closest equivalent to exceptions — and it's both more limited and more dangerous.",
            sections: [
                {
                    title: "How setjmp and longjmp Work",
                    content: "Think of <code>setjmp</code> as placing a bookmark in the execution. <code>longjmp</code> teleports execution back to that bookmark — unwinding the call stack without running any cleanup code. The function that called <code>setjmp</code> must still be active on the stack.",
                    code: `#include <stdio.h>
#include <setjmp.h>

jmp_buf recovery_point;

void risky(int x) {
    if (x < 0) {
        printf("Error: negative input, jumping back\\n");
        longjmp(recovery_point, 1);
    }
    printf("Processed %d successfully\\n", x);
}

void middle(int x) {
    printf("  entering middle(%d)\\n", x);
    risky(x);
    printf("  middle completed normally\\n");
}

int main(void) {
    int result = setjmp(recovery_point);

    if (result == 0) {
        printf("Starting...\\n");
        middle(5);
        middle(-1);   // Will longjmp
        printf("Never reached\\n");
    } else {
        printf("Recovered from error (code %d)\\n", result);
    }
    printf("Continues normally\\n");
    return 0;
}`,
                    output: `Starting...
  entering middle(5)
Processed 5 successfully
  middle completed normally
  entering middle(-1)
Error: negative input, jumping back
Recovered from error (code 1)
Continues normally`
                },
                {
                    title: "Rules and the Volatile Requirement",
                    content: "The C standard imposes strict rules on <code>setjmp</code> usage. The most surprising: local variables modified between <code>setjmp</code> and <code>longjmp</code> may revert to their values at the time of <code>setjmp</code> unless declared <code>volatile</code>.",
                    points: [
                        "<strong>setjmp must appear as a standalone expression</strong> — only as the controlling expression of <code>if</code>, <code>switch</code>, or a loop. Not inside larger expressions.",
                        "<strong>The containing function must still be alive</strong> when <code>longjmp</code> is called. Jumping into a returned function is undefined behavior.",
                        "<strong>Declare volatile</strong>: Any local variable in the <code>setjmp</code> function that changes after the <code>setjmp</code> call must be <code>volatile</code> to have a defined value after the jump.",
                        "<strong>No cleanup</strong>: <code>longjmp</code> does not call any cleanup — open files stay open, allocated memory stays allocated. Plan accordingly.",
                        "<strong>Practical use</strong>: Error handling in recursive parsers and interpreters — one <code>longjmp</code> from any depth aborts the entire parse without threading error codes through every return."
                    ],
                    warning: "If you've acquired resources (malloc, fopen) between <code>setjmp</code> and <code>longjmp</code>, those resources are leaked unless you track them explicitly. This is the primary reason <code>longjmp</code> should be used sparingly and only in well-defined error-recovery patterns."
                }
            ]
        },
        {
            id: "unreachable-c23",
            title: "unreachable(), [[noreturn]], and Program Termination (C23)",
            explanation: "C23 introduces <code>unreachable()</code>, a macro that tells the compiler a code path is impossible. This is a promise — breaking it is undefined behavior — but when kept it enables dead-branch elimination, cleaner switch exhaustion, and tighter code. Paired with <code>[[noreturn]]</code> and the termination functions, it gives you precise control over how and why a program ends.",
            sections: [
                {
                    title: "unreachable() (C23)",
                    content: "<code>unreachable()</code> from <code>&lt;stddef.h&gt;</code> tells the compiler: execution will never reach this point. Common uses: after exhaustive switch statements, after validated precondition checks, and anywhere static analysis needs a hint.",
                    code: `#include <stdio.h>
#include <stddef.h>
#include <stdlib.h>

typedef enum { RED, GREEN, BLUE } Color;

const char* color_name(Color c) {
    switch (c) {
        case RED:   return "red";
        case GREEN: return "green";
        case BLUE:  return "blue";
    }
    unreachable();   // All cases handled — no return warning
}

int safe_divide(int num, int den) {
    if (den == 0) unreachable();  // Caller's precondition
    return num / den;
}

int main(void) {
    printf("%s\\n", color_name(GREEN));
    printf("%d\\n", safe_divide(10, 2));
    return 0;
}`,
                    output: "green\n5",
                    warning: "If <code>unreachable()</code> is actually reached, behavior is undefined — the compiler may have already eliminated surrounding checks. For debug builds, guard it: <code>#ifdef NDEBUG unreachable() #else abort() #endif</code>."
                },
                {
                    title: "[[noreturn]] and Termination Functions",
                    content: "Functions that always terminate the program should be marked <code>[[noreturn]]</code> (C23) so callers don't need a return after them and the compiler can optimize accordingly. The standard provides four termination functions with different cleanup semantics.",
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>

[[noreturn]]
void fatal(const char *fmt, ...) {
    va_list args;
    va_start(args);
    fprintf(stderr, "FATAL: ");
    vfprintf(stderr, fmt, args);
    fprintf(stderr, "\\n");
    va_end(args);
    abort();  // No cleanup — state is corrupt
}

void cleanup_handler(void) { printf("cleanup() called\\n"); }

int main(void) {
    atexit(cleanup_handler);

    int x = -1;
    if (x < 0) {
        // exit(): flushes buffers, runs atexit() handlers
        // abort(): does NOT run atexit(), dumps core
        // _Exit(): no cleanup at all (useful after fork())
        fprintf(stderr, "bad input\\n");
        exit(EXIT_FAILURE);   // cleanup_handler WILL run
    }
    return 0;
}`,
                    output: "bad input\ncleanup() called"
                }
            ]
        },
        {
            id: "threads-c11",
            title: "Threads with <threads.h> (C11)",
            explanation: "C11 standardized multithreading via <code>&lt;threads.h&gt;</code>. It provides threads (<code>thrd_t</code>), mutexes (<code>mtx_t</code>), condition variables (<code>cnd_t</code>), and thread-local storage (<code>thread_local</code>). This is a portable, minimal threading API — simpler than POSIX threads, and available wherever C11 is supported.",
            sections: [
                {
                    title: "Creating and Joining Threads",
                    content: "A thread is created with <code>thrd_create</code>, which takes a function pointer and a <code>void*</code> argument. The thread runs the function and exits when it returns. <code>thrd_join</code> waits for completion.",
                    code: `#include <stdio.h>
#include <threads.h>

typedef struct { int id; int result; } WorkItem;

int worker(void *arg) {
    WorkItem *item = (WorkItem*)arg;
    item->result = item->id * item->id;
    printf("Thread %d: %d^2 = %d\\n", item->id, item->id, item->result);
    return thrd_success;
}

int main(void) {
    thrd_t threads[4];
    WorkItem items[4];

    for (int i = 0; i < 4; i++) {
        items[i] = (WorkItem){ .id = i + 1 };
        thrd_create(&threads[i], worker, &items[i]);
    }
    for (int i = 0; i < 4; i++) {
        thrd_join(threads[i], NULL);
    }
    printf("All done.\\n");
    return 0;
}`,
                    output: "Thread 1: 1^2 = 1\nThread 2: 2^2 = 4\nThread 3: 3^2 = 9\nThread 4: 4^2 = 16\nAll done.",
                    tip: "Thread execution order is non-deterministic. The output may arrive in any order — only the main thread's 'All done.' is guaranteed last because it waits with <code>thrd_join</code>."
                },
                {
                    title: "Mutexes and Condition Variables",
                    content: "Mutexes prevent race conditions by ensuring only one thread executes a protected section at a time. Condition variables let threads sleep until a condition becomes true — far more efficient than busy-polling.",
                    code: `#include <stdio.h>
#include <threads.h>

// --- Mutex example: safe counter ---
int counter = 0;
mtx_t lock;

int increment(void *arg) {
    (void)arg;
    for (int i = 0; i < 1000; i++) {
        mtx_lock(&lock);
        counter++;          // Only one thread here at a time
        mtx_unlock(&lock);
    }
    return thrd_success;
}

int main(void) {
    mtx_init(&lock, mtx_plain);

    thrd_t t[10];
    for (int i = 0; i < 10; i++) thrd_create(&t[i], increment, NULL);
    for (int i = 0; i < 10; i++) thrd_join(t[i], NULL);

    printf("Expected: 10000\\n");
    printf("Got:      %d\\n", counter);  // Always 10000 with the mutex

    mtx_destroy(&lock);
    return 0;
}`,
                    output: "Expected: 10000\nGot:      10000"
                },
                {
                    title: "thread_local: Per-Thread Storage (C11)",
                    content: "The <code>thread_local</code> storage class gives each thread its own independent copy of a variable. Changes in one thread don't affect others.",
                    code: `#include <stdio.h>
#include <threads.h>

thread_local int tl_id = 0;   // Each thread has its own copy

int worker(void *arg) {
    tl_id = *(int*)arg;        // Sets THIS thread's copy only
    printf("Thread %d: tl_id = %d\\n", tl_id, tl_id);
    return thrd_success;
}

int main(void) {
    thrd_t t[3];
    int ids[3] = {1, 2, 3};
    for (int i = 0; i < 3; i++) thrd_create(&t[i], worker, &ids[i]);
    for (int i = 0; i < 3; i++) thrd_join(t[i], NULL);
    printf("Main thread: tl_id = %d\\n", tl_id);  // Still 0
    return 0;
}`,
                    output: "Thread 1: tl_id = 1\nThread 2: tl_id = 2\nThread 3: tl_id = 3\nMain thread: tl_id = 0"
                }
            ]
        },
        {
            id: "restrict-inline",
            title: "Performance: restrict and inline",
            explanation: "Two C features exist almost exclusively to give the compiler more information for faster code: <code>restrict</code> promises that two pointers don't alias each other, and <code>inline</code> hints that a function should be expanded at the call site rather than called through the normal function-call mechanism.",
            sections: [
                {
                    title: "restrict: Promising No Aliasing",
                    content: "When two pointers might point to the same memory (aliasing), the compiler must generate conservative code — re-reading from memory after every write. The <code>restrict</code> qualifier promises that no other pointer not derived from this one accesses the same object, enabling vectorization, loop reordering, and register caching.",
                    code: `#include <stdio.h>

// WITHOUT restrict: compiler must assume dst and src could overlap
void add_slow(double *dst, const double *src, int n) {
    for (int i = 0; i < n; i++) dst[i] += src[i];
}

// WITH restrict: compiler can vectorize, keep values in registers
void add_fast(double *restrict dst, const double *restrict src, int n) {
    for (int i = 0; i < n; i++) dst[i] += src[i];
}

int main(void) {
    double a[] = {1.0, 2.0, 3.0, 4.0};
    double b[] = {10.0, 20.0, 30.0, 40.0};
    add_fast(a, b, 4);
    for (int i = 0; i < 4; i++) printf("a[%d] = %.1f\\n", i, a[i]);
    return 0;
}`,
                    output: "a[0] = 11.0\na[1] = 22.0\na[2] = 33.0\na[3] = 44.0",
                    warning: "If you declare a pointer <code>restrict</code> and pass aliased (overlapping) memory, the behavior is undefined and the compiler will silently generate wrong results. This is why <code>memcpy</code> (declared with <code>restrict</code>) cannot be used for overlapping memory — use <code>memmove</code> for that."
                },
                {
                    title: "inline: Eliminating Call Overhead",
                    content: "A function marked <code>inline</code> hints to the compiler to expand the function body at the call site. This eliminates the overhead of pushing arguments, jumping, and returning. Use <code>static inline</code> for utility functions in headers to avoid multiple-definition linker errors.",
                    code: `#include <stdio.h>

static inline int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

static inline double lerp(double a, double b, double t) {
    return a + t * (b - a);
}

int main(void) {
    int pixels[] = {-5, 0, 128, 255, 300};
    for (int i = 0; i < 5; i++) {
        printf("clamp(%4d) = %d\\n", pixels[i], clamp(pixels[i], 0, 255));
    }
    printf("lerp(0,100,0.25) = %.1f\\n", lerp(0.0, 100.0, 0.25));
    printf("lerp(0,100,0.75) = %.1f\\n", lerp(0.0, 100.0, 0.75));
    return 0;
}`,
                    output: "clamp(  -5) = 0\nclamp(   0) = 0\nclamp( 128) = 128\nclamp( 255) = 255\nclamp( 300) = 255\nlerp(0,100,0.25) = 25.0\nlerp(0,100,0.75) = 75.0",
                    tip: "<code>inline</code> is only a hint — modern compilers often inline without it when optimization is enabled, and may ignore it for large functions. The <code>static</code> in <code>static inline</code> is what prevents linker errors when the header is included from multiple .c files."
                }
            ]
        }
    ],

    practice: [
        {
            title: "Safe Number Parser",
            difficulty: "easy",
            problem: "Write a function <code>parseInteger(const char *str, int *result)</code> that converts a string to an integer using <code>strtol</code>. Return 1 on success, 0 on failure (non-numeric input or empty string). Test it with '42', 'abc', '123xyz', and ''.",
            hint: "Check both that endptr moved from the start AND that it now points to the null terminator.",
            solution: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

int parseInteger(const char *str, int *result) {
    if (!str || *str == '\\0') return 0;
    char *endptr;
    errno = 0;
    long val = strtol(str, &endptr, 10);
    if (endptr == str || *endptr != '\\0') return 0;
    *result = (int)val;
    return 1;
}

int main(void) {
    int val;
    const char *tests[] = {"42", "abc", "123xyz", "", "-99", "0"};
    for (int i = 0; i < 6; i++) {
        if (parseInteger(tests[i], &val))
            printf("'%s' -> %d\\n", tests[i], val);
        else
            printf("'%s' -> INVALID\\n", tests[i]);
    }
    return 0;
}`
        },
        {
            title: "Custom Logger with vprintf",
            difficulty: "medium",
            problem: "Write a variadic <code>log(level, fmt, ...)</code> function with three levels: INFO, WARN, ERROR. Each message should be prefixed with <code>[INFO]</code>, <code>[WARN]</code>, or <code>[ERROR]</code>. Use <code>vprintf</code> to forward the format arguments.",
            hint: "Use <code>va_start</code>/<code>va_end</code> around a call to <code>vprintf(fmt, ap)</code>.",
            solution: `#include <stdio.h>
#include <stdarg.h>

typedef enum { LOG_INFO, LOG_WARN, LOG_ERROR } Level;

void log_msg(Level level, const char *fmt, ...) {
    const char *prefix[] = {"INFO", "WARN", "ERROR"};
    printf("[%s] ", prefix[level]);
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\\n");
}

int main(void) {
    log_msg(LOG_INFO,  "Server started on port %d", 8080);
    log_msg(LOG_WARN,  "Memory at %d%%", 85);
    log_msg(LOG_ERROR, "File not found: %s", "data.csv");
    return 0;
}`,
            explanation: "<code>vprintf</code> is the key: it accepts a <code>va_list</code> instead of <code>...</code>, so you can forward your variadic arguments to it without processing them yourself. This is the standard pattern for any wrapper around printf-family functions."
        },
        {
            title: "Type-Safe Print Macro with _Generic",
            difficulty: "medium",
            problem: "Using <code>_Generic</code>, write a macro <code>PRINT(x)</code> that selects the correct format specifier for <code>int</code>, <code>double</code>, <code>float</code>, <code>long</code>, and <code>char*</code>, and prints both the type name and the value. Example output: <code>int: 42</code>.",
            hint: "Select a format string with _Generic, then pass it and the value to printf.",
            solution: `#include <stdio.h>

#define PRINT(X) printf(_Generic((X),       \\
    int:    "int: %d\\n",                   \\
    long:   "long: %ld\\n",                 \\
    float:  "float: %f\\n",                 \\
    double: "double: %f\\n",                \\
    char*:  "char*: %s\\n"                  \\
), (X))

int main(void) {
    PRINT(42);
    PRINT(3.14);
    PRINT(2.7f);
    PRINT(100L);
    PRINT("hello");
    return 0;
}`,
            explanation: "<code>_Generic</code> selects the format string literal at compile time. X is evaluated only once — type selection and value printing are two separate steps in the macro expansion."
        },
        {
            title: "Generic Array Sorter with qsort",
            difficulty: "medium",
            problem: "Use <code>qsort</code> to sort an array of <code>struct Student</code> (name and GPA) by GPA in descending order. Print the sorted list with rankings.",
            hint: "The comparator receives <code>const void*</code> pointers. Cast to <code>struct Student*</code> and compare GPA fields. Reverse the sign for descending order.",
            solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct { char name[20]; float gpa; } Student;

int byGPADesc(const void *a, const void *b) {
    const Student *sa = (const Student*)a;
    const Student *sb = (const Student*)b;
    if (sa->gpa > sb->gpa) return -1;
    if (sa->gpa < sb->gpa) return  1;
    return 0;
}

int main(void) {
    Student students[] = {
        {"Alice", 3.5}, {"Bob", 3.8}, {"Charlie", 3.2},
        {"Diana", 3.9}, {"Eve",  3.6}
    };
    int n = 5;
    qsort(students, n, sizeof(Student), byGPADesc);
    for (int i = 0; i < n; i++)
        printf("%d. %-10s %.1f\\n", i+1, students[i].name, students[i].gpa);
    return 0;
}`
        },
        {
            title: "Error Handling with setjmp/longjmp",
            difficulty: "hard",
            problem: "Implement a simple expression evaluator for strings like <code>\"10 / 2\"</code> and <code>\"5 / 0\"</code>. Use <code>setjmp</code>/<code>longjmp</code> to handle division by zero by jumping to a recovery point rather than propagating error codes through every function.",
            hint: "Define ERR_DIV_ZERO = 1. Call <code>setjmp</code> in main and <code>longjmp</code> from the division function when denominator is zero.",
            solution: `#include <stdio.h>
#include <setjmp.h>
#include <stdlib.h>

jmp_buf err_jmp;
#define ERR_DIV_ZERO 1

int safe_div(int a, int b) {
    if (b == 0) longjmp(err_jmp, ERR_DIV_ZERO);
    return a / b;
}

int evaluate(const char *expr) {
    int a, b; char op;
    sscanf(expr, "%d %c %d", &a, &op, &b);
    switch (op) {
        case '/': return safe_div(a, b);
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
    }
    return 0;
}

int main(void) {
    const char *exprs[] = {"10 / 2", "5 / 0", "3 + 4", NULL};
    for (int i = 0; exprs[i]; i++) {
        int code = setjmp(err_jmp);
        if (code == 0)
            printf("%s = %d\\n", exprs[i], evaluate(exprs[i]));
        else
            printf("%s => division by zero\\n", exprs[i]);
    }
    return 0;
}`,
            explanation: "Each iteration re-calls <code>setjmp</code> to establish a fresh recovery point. When <code>longjmp</code> fires, execution resumes at that <code>setjmp</code> with the error code. The idiom <code>if (code == 0) { normal } else { recovery }</code> is the canonical pattern."
        },
        {
            title: "Cache-Friendly Matrix Sum",
            difficulty: "hard",
            problem: "Create a 512×512 int matrix filled with sequential values. Write two sum functions: row-major and column-major iteration. Use <code>clock()</code> to time both. The row-major version should be noticeably faster due to cache locality.",
            solution: `#include <stdio.h>
#include <time.h>

#define N 512
int matrix[N][N];

long long rowSum(void) {
    long long s = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) s += matrix[i][j];
    return s;
}

long long colSum(void) {
    long long s = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++) s += matrix[i][j];
    return s;
}

int main(void) {
    int v = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) matrix[i][j] = v++;

    clock_t s, e;
    s = clock(); long long r = rowSum(); e = clock();
    printf("Row-major:    sum=%lld  %ldms\\n", r, (e-s)*1000/CLOCKS_PER_SEC);

    s = clock(); long long c = colSum(); e = clock();
    printf("Col-major:    sum=%lld  %ldms\\n", c, (e-s)*1000/CLOCKS_PER_SEC);
    return 0;
}`
        }
    ],

    quiz: [
        {
            question: "In a variadic function, what does va_arg(ap, type) do?",
            options: ["Returns the count of remaining arguments", "Retrieves the next argument, interpreted as 'type'", "Advances to the next fixed parameter", "Checks whether an argument of 'type' exists"],
            answer: 1,
            explanation: "va_arg(ap, type) retrieves the next argument from the va_list, interpreting the bytes as the specified type. The type must exactly match what was passed — getting it wrong is undefined behavior."
        },
        {
            question: "Why must you call va_end(ap) before returning from a variadic function?",
            options: ["To free the va_list heap allocation", "To restore any stack state the va_list machinery may have modified", "To reset the argument count to zero", "To flush buffered output"],
            answer: 1,
            explanation: "va_end cleans up any resources or state the va_list machinery allocated. On some architectures va_start allocates resources; va_end releases them. Always pair them."
        },
        {
            question: "What does _Generic select on?",
            options: ["The runtime value of the controlling expression", "The compile-time type of the controlling expression", "The size of the controlling expression", "The pointer address of the controlling expression"],
            answer: 1,
            explanation: "_Generic selects an expression based on the compile-time type of the controlling expression — not its value. It's resolved entirely at compile time."
        },
        {
            question: "In C23, what does 'auto x = 3.14;' deduce as the type of x?",
            options: ["float", "long double", "double", "auto (a special type)"],
            answer: 2,
            explanation: "3.14 without a suffix is a double literal in C. auto deduces the type from the initializer, so x gets type double."
        },
        {
            question: "After longjmp() is called, where does execution resume?",
            options: ["At the most recently called setjmp()", "At the beginning of main()", "At the setjmp() call whose jmp_buf was passed to longjmp()", "At a randomly selected setjmp() on the call stack"],
            answer: 2,
            explanation: "longjmp resumes execution at the setjmp call whose jmp_buf was passed as the first argument. It does not 'return' — it teleports execution."
        },
        {
            question: "What does unreachable() promise to the compiler?",
            options: ["That the function has no return value", "That the next statement is always executed", "That execution will never reach that point in the code", "That the surrounding loop will terminate"],
            answer: 2,
            explanation: "unreachable() tells the compiler this code path will never execute. The compiler may optimize away surrounding checks based on this promise."
        },
        {
            question: "In C11's <threads.h>, which function waits for a thread to finish?",
            options: ["thrd_sleep()", "thrd_wait()", "thrd_join()", "thrd_sync()"],
            answer: 2,
            explanation: "thrd_join blocks the calling thread until the specified thread finishes. It's the C11 equivalent of POSIX pthread_join."
        },
        {
            question: "What does the 'restrict' qualifier promise to the compiler?",
            options: ["The pointer is read-only", "The pointer will never be NULL", "No other non-derived pointer accesses the same object during the pointer's lifetime", "The pointer points to heap memory"],
            answer: 2,
            explanation: "restrict promises that no other pointer (not derived from this one) will access the same memory during its lifetime. This enables vectorization and load/store reordering."
        },
        {
            question: "What is a race condition?",
            options: ["A performance problem in loops", "A bug caused by two threads accessing shared data without synchronization", "A memory leak in threads", "A type mismatch error"],
            answer: 1,
            explanation: "A race condition occurs when two threads access shared data concurrently without synchronization, and at least one access is a write. The outcome depends on scheduling timing."
        },
        {
            question: "Which function should you use instead of atoi for reliable error detection?",
            options: ["itoa", "strtol", "scanf", "sscanf"],
            answer: 1,
            explanation: "strtol detects errors: it sets errno on overflow and updates endptr to point after the last consumed character. atoi gives no error indication — it silently returns 0 on failure."
        }
    ],

    exam: [
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdarg.h>
int sum(int count, ...) {
    va_list ap;
    va_start(ap, count);
    int total = 0;
    for (int i = 0; i < count; i++)
        total += va_arg(ap, int);
    va_end(ap);
    return total;
}
int main(void) {
    printf("%d\\n", sum(3, 10, 20, 30));
    printf("%d\\n", sum(2, 5, 5));
    return 0;
}`,
            options: ["60 then 10", "30 then 5", "60 then 5", "30 then 10"],
            answer: 0,
            explanation: "sum(3, 10,20,30) adds 10+20+30=60. sum(2, 5,5) adds 5+5=10. The count argument tells the function how many variadic args to consume."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#define TYPE(X) _Generic((X),  \\
    int:    "int",             \\
    double: "double",          \\
    float:  "float",           \\
    default:"other"            \\
)
int main(void) {
    printf("%s\\n", TYPE(42));
    printf("%s\\n", TYPE(3.14));
    printf("%s\\n", TYPE(3.14f));
    return 0;
}`,
            options: ["int then double then float", "int then float then double", "other then double then float", "int then double then other"],
            answer: 0,
            explanation: "_Generic dispatches at compile-time based on type. 42 is int, 3.14 is double, 3.14f is float. Each selects the matching branch."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <setjmp.h>
jmp_buf buf;
void risky(int x) {
    if (x < 0) longjmp(buf, 99);
    printf("ok: %d\\n", x);
}
int main(void) {
    int r = setjmp(buf);
    if (r == 0) {
        risky(5);
        risky(-1);
        risky(3);
    } else {
        printf("caught: %d\\n", r);
    }
    return 0;
}`,
            options: ["ok: 5 then ok: 3 then caught: 99", "ok: 5 then caught: 99", "caught: 99", "ok: 5 then ok: -1 then caught: 99"],
            answer: 1,
            explanation: "risky(5) succeeds and prints 'ok: 5'. risky(-1) calls longjmp which jumps back to setjmp with value 99. The else branch runs and risky(3) is never reached."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <string.h>
int main(void) {
    char *s = "Hello, World!";
    char *p = strchr(s, ',');
    if (p) printf("%s\\n", p + 1);
    char *q = strrchr(s, 'l');
    if (q) printf("%c\\n", *q);
    return 0;
}`,
            options: [" World! then l", "World! then l", " World! then L", ", World! then l"],
            answer: 0,
            explanation: "strchr finds the first ',', so p+1 skips it: ' World!'. strrchr finds the LAST 'l' which is in 'World' at position 10. *q = 'l'."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <time.h>
int main(void) {
    time_t t = 0;
    struct tm *s = gmtime(&t);
    printf("%d\\n", s->tm_year + 1900);
    printf("%d\\n", s->tm_mon + 1);
    return 0;
}`,
            options: ["1970 then 1", "0 then 0", "1900 then 1", "1970 then 0"],
            answer: 0,
            explanation: "time_t = 0 is the Unix epoch: January 1, 1970. tm_year is years since 1900 (70 + 1900 = 1970). tm_mon is 0-indexed (0 + 1 = 1)."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
typedef enum { RED=0, GREEN=1, BLUE=2 } Color;
const char* name(Color c) {
    switch (c) {
        case RED:   return "red";
        case GREEN: return "green";
        case BLUE:  return "blue";
    }
    __builtin_unreachable();
}
int main(void) {
    for (int i = 0; i < 3; i++)
        printf("%s\\n", name((Color)i));
    return 0;
}`,
            options: ["red then green then blue", "0 then 1 then 2", "RED then GREEN then BLUE", "Undefined behavior"],
            answer: 0,
            explanation: "The loop casts 0, 1, 2 to Color. Each matches a case and returns the string. unreachable() tells the compiler no other values arrive — no missing-return warning."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
static inline int clamp(int v, int lo, int hi) {
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
}
int main(void) {
    printf("%d\\n", clamp(-5, 0, 10));
    printf("%d\\n", clamp(7,  0, 10));
    printf("%d\\n", clamp(15, 0, 10));
    return 0;
}`,
            options: ["0 then 7 then 10", "-5 then 7 then 15", "0 then 0 then 10", "0 then 7 then 15"],
            answer: 0,
            explanation: "clamp(-5, 0, 10): -5 < 0 → 0. clamp(7, 0, 10): in range → 7. clamp(15, 0, 10): 15 > 10 → 10."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdarg.h>
void log_msg(const char *fmt, ...) {
    va_list ap;
    va_start(ap, fmt);
    printf("[LOG] ");
    vprintf(fmt, ap);
    va_end(ap);
}
int main(void) {
    log_msg("x=%d y=%d\\n", 3, 7);
    return 0;
}`,
            options: ["[LOG] x=3 y=7", "x=3 y=7", "[LOG] fmt", "Compile error"],
            answer: 0,
            explanation: "vprintf forwards the va_list to printf. The [LOG] prefix is printed first, then vprintf expands the format string with the arguments."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    double arr[] = {1.0, 2.0, 3.0, 4.0};
    double *restrict p = arr;
    double *restrict q = arr + 2;
    for (int i = 0; i < 2; i++) {
        p[i] += q[i];
    }
    printf("%.0f %.0f\\n", arr[0], arr[1]);
    return 0;
}`,
            options: ["4 6", "1 2", "3 4", "2 4"],
            answer: 0,
            explanation: "p[0] += q[0]: arr[0] += arr[2] → 1+3=4. p[1] += q[1]: arr[1] += arr[3] → 2+4=6. The restrict here is technically valid since p and q don't overlap."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <string.h>
int main(void) {
    char dest[20] = "Hello";
    char *end = memccpy(dest + 5, ", World!", '!', 10);
    if (end) *end = '\\0';
    printf("%s\\n", dest);
    return 0;
}`,
            options: ["Hello, World!", "Hello", "Hello, World", ", World!"],
            answer: 0,
            explanation: "memccpy copies from ', World!' into dest+5, stopping after '!' and returning the byte after it. Null-terminating there gives 'Hello, World!'."
        }
    ]
};

window.ModuleExpert = ModuleExpert;