const ModuleExtra = {
    description: "The gaps and C23 additions: type casting, command-line args, const correctness, atomics, the stdlib functions you'll actually use — plus C23's strdup, stdbit.h, checked arithmetic — and a final lesson on where to go next: projects, tools, references, and the real C codebases worth reading.",

    lessons: [
        {
            id: "type-casting",
            title: "Type Casting",
            explanation: "C is a statically typed language, but it will silently convert between types whenever it thinks it knows what you mean. Sometimes it's right. Sometimes it produces subtly wrong results and doesn't tell you. Understanding when C converts automatically and when you need to be explicit is what separates code that works from code that works most of the time.",
            sections: [
                {
                    title: "Implicit Conversion (Type Promotion)",
                    content: "When an expression involves operands of different types, C automatically promotes the smaller type to match the larger one before performing the operation. This is called implicit conversion or arithmetic promotion. The general rule is that smaller types are promoted to larger ones: <code>char</code> → <code>int</code> → <code>long</code> → <code>float</code> → <code>double</code>. The result takes the type of the larger operand.",
                    points: [
                        "<strong>int + float → float</strong>: When you mix an integer and a float in an expression, the integer is promoted to float. The result is float. This is usually what you want, but it means the integer's exact value must be representable as a float — for large integers, this causes silent precision loss.",
                        "<strong>char in arithmetic → int</strong>: Whenever a <code>char</code> participates in arithmetic, it's promoted to <code>int</code> first. Always. This matters when you're checking for overflow or doing bit manipulation on characters.",
                        "<strong>Signed + Unsigned → Unsigned</strong>: This is the dangerous one. If you mix a signed int and an unsigned int in an expression, the signed value is converted to unsigned. If the signed value was negative, it wraps to a huge positive number. Comparisons like <code>if (signed_val < unsigned_val)</code> can silently produce wrong results."
                    ],
                    code: `#include <stdio.h>

int main() {
    // int / int = int (truncated, NOT rounded)
    int a = 7, b = 2;
    printf("int/int:   %d\\n", a / b);       // 3, not 3.5
    
    // int / float = float (int is promoted first)
    printf("int/float: %f\\n", a / 2.0);     // 3.500000
    
    // Dangerous: signed meets unsigned
    int negative = -1;
    unsigned int positive = 1;
    // -1 converted to unsigned becomes 4294967295 on 32-bit
    if (negative < positive) {
        printf("negative < positive (correct)\\n");
    } else {
        printf("WARNING: -1 is not less than 1 here!\\n"); // This runs!
    }
    
    // char arithmetic promotes to int
    char c = 200; // fits in unsigned char, wraps in signed char
    printf("char + 1:  %d\\n", c + 1);       // int result
    
    return 0;
}`,
                    output: "int/int:   3\nint/float: 3.500000\nWARNING: -1 is not less than 1 here!\nchar + 1:  201",
                    warning: "The signed/unsigned comparison trap has caused real security bugs. A common pattern: a function returns <code>-1</code> on error as a signed int, but the caller stores it in an unsigned variable and compares it to a size. The <code>-1</code> becomes a massive number, the comparison is wrong, and the error is silently ignored. Always use consistent signedness in comparisons, or cast explicitly."
                },
                {
                    title: "Explicit Casting",
                    content: "An explicit cast tells the compiler 'I know what I'm doing, convert this value to this type right now'. The syntax is <code>(type)expression</code>. It overrides implicit conversion rules and makes your intent clear both to the compiler and to anyone reading the code. It does not guarantee correctness — you can cast to the wrong type and get garbage — but at least the intention is documented.",
                    points: [
                        "<strong>Forcing float division</strong>: <code>(float)a / b</code> casts <code>a</code> to float before division, forcing float arithmetic. Without the cast, <code>a / b</code> is integer division.",
                        "<strong>Truncating floats</strong>: <code>(int)3.9</code> gives <code>3</code> — it truncates toward zero, it does not round. <code>(int)-3.9</code> gives <code>-3</code>, not <code>-4</code>.",
                        "<strong>Narrowing casts</strong>: Casting a larger type to a smaller one (e.g., <code>int</code> to <code>char</code>) silently discards the upper bytes. If the value doesn't fit in the destination type, you get a truncated, probably meaningless result.",
                        "<strong>Pointer casts</strong>: You can cast between pointer types. This is sometimes necessary (e.g., casting <code>void*</code> from <code>malloc</code>), but casting an <code>int*</code> to a <code>char*</code> and dereferencing it reads individual bytes — which is useful for serialization and type punning, but requires care."
                    ],
                    code: `#include <stdio.h>

int main() {
    int a = 7, b = 2;
    
    // Explicit cast forces float division
    float result = (float)a / b;
    printf("(float)a / b = %.1f\\n", result);   // 3.5
    
    // Truncation, not rounding
    double d = 3.9;
    printf("(int)3.9  = %d\\n", (int)d);         // 3
    printf("(int)-3.9 = %d\\n", (int)-3.9);      // -3, not -4
    
    // Narrowing: value doesn't fit, bits are discarded
    int big = 256;
    char small = (char)big; // 256 = 0x100, only low byte kept = 0x00
    printf("(char)256 = %d\\n", small);           // 0
    
    int big2 = 200;
    char small2 = (char)big2; // 200 = 0xC8, as signed char = -56
    printf("(char)200 = %d\\n", small2);          // -56
    
    // Pointer cast: look at raw bytes of a float
    float f = 1.0f;
    unsigned int *ip = (unsigned int*)&f;
    printf("Float 1.0 as hex: 0x%X\\n", *ip);    // IEEE 754 representation
    
    return 0;
}`,
                    output: "(float)a / b = 3.5\n(int)3.9  = 3\n(int)-3.9 = -3\n(char)256 = 0\n(char)200 = -56\nFloat 1.0 as hex: 0x3F800000",
                    tip: "If you find yourself casting the same expression repeatedly, or casting in ways that feel wrong, that's usually a sign the surrounding variable types should be changed instead. Casts are for the boundaries between systems — where an API returns <code>void*</code>, or where you genuinely need to inspect raw bytes. Using them to paper over type mismatches in your own code is a sign of a design problem."
                }
            ]
        },
        {
            id: "argc-argv",
            title: "Command-Line Arguments",
            explanation: "Every C program we've written starts with <code>int main()</code>. But <code>main</code> can accept arguments — values the user passes on the command line when running the program. This is how tools like <code>gcc</code>, <code>ls</code>, and every command-line utility ever written receive their inputs. The mechanism is two parameters: <code>argc</code> and <code>argv</code>.",
            sections: [
                {
                    title: "argc and argv",
                    content: "<code>main</code> has a second valid signature: <code>int main(int argc, char *argv[])</code>. The OS populates these before calling your <code>main</code>. <code>argc</code> (argument count) is the number of arguments, including the program's own name. <code>argv</code> (argument vector) is an array of strings — one per argument. <code>argv[0]</code> is always the program name or path. The actual user arguments start at <code>argv[1]</code>.",
                    points: [
                        "<code>argc</code> is always at least 1, because <code>argv[0]</code> is always present (the program name).",
                        "<code>argv</code> is of type <code>char *argv[]</code> — an array of pointers to strings. Equivalently written as <code>char **argv</code>. Both declarations mean the same thing here.",
                        "<code>argv[argc]</code> is guaranteed to be <code>NULL</code> — a null pointer marks the end of the array. You can use this as a sentinel to iterate without knowing <code>argc</code>, though using <code>argc</code> is cleaner.",
                        "All arguments arrive as strings, always. If you run <code>./calc 5 3</code>, <code>argv[1]</code> is the string <code>\"5\"</code>, not the integer 5. You must convert manually using <code>atoi</code>, <code>strtol</code>, or <code>sscanf</code>."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    printf("Program name: %s\\n", argv[0]);
    printf("Argument count: %d\\n", argc);
    
    // argc is 1 if no arguments were given (just the program name)
    if (argc < 3) {
        printf("Usage: %s <num1> <num2>\\n", argv[0]);
        return 1; // Non-zero = error
    }
    
    // Arguments are strings - convert to integers
    int a = atoi(argv[1]);
    int b = atoi(argv[2]);
    
    printf("%d + %d = %d\\n", a, b, a + b);
    printf("%d * %d = %d\\n", a, b, a * b);
    
    return 0;
}`,
                    output: "// If run as: ./program 10 5\nProgram name: ./program\nArgument count: 3\n10 + 5 = 15\n10 * 5 = 50"
                },
                {
                    title: "Iterating Over Arguments",
                    content: "When you don't know how many arguments there will be — like a program that accepts a list of filenames — you loop over <code>argv</code> starting from index 1. The loop condition is usually <code>i < argc</code>. You can also check flags (arguments starting with <code>-</code>) to implement simple command-line options.",
                    code: `#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
    int verbose = 0;
    int count = 0;
    
    // Loop through all arguments, looking for flags and values
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-v") == 0) {
            verbose = 1; // Flag detected
        } else {
            count++;
            if (verbose) {
                printf("Arg %d: '%s'\\n", count, argv[i]);
            } else {
                printf("%s\\n", argv[i]);
            }
        }
    }
    
    printf("Total non-flag args: %d\\n", count);
    return 0;
}`,
                    output: "// Run as: ./program -v hello world\nArg 1: 'hello'\nArg 2: 'world'\nTotal non-flag args: 2",
                    tip: "For simple tools with a few flags, hand-rolling argument parsing like this is perfectly fine. For anything more complex — optional values, short and long flags like <code>-v</code> / <code>--verbose</code> — use the POSIX <code>getopt</code> function from <code>&lt;unistd.h&gt;</code>. It handles the standard Unix argument conventions automatically and saves you from writing a lot of fragile string-comparison code."
                }
            ]
        },
        {
            id: "const-pointers",
            title: "const and Pointers",
            explanation: "<code>const</code> on its own is straightforward — it marks a variable as read-only. But <code>const</code> combined with pointers has three distinct meanings depending on where the keyword appears, and confusing them is one of the most common sources of compiler warnings and subtle bugs in C. This is worth learning precisely because you will see all three forms constantly in real code and library headers.",
            sections: [
                {
                    title: "Three Forms, Three Meanings",
                    content: "The position of <code>const</code> relative to the <code>*</code> completely determines what is protected. A useful reading rule: start from the variable name and apply the Right-Left Rule. <code>const</code> modifies whatever is immediately to its right.",
                    points: [
                        "<strong><code>const int *p</code></strong> — pointer to const int: The data pointed to is read-only. You cannot write <code>*p = 5</code>. But you can change what <code>p</code> points to: <code>p = &other</code> is fine. The pointer itself is mutable; the value it points to is not. Use this when passing data to a function that should read but not modify it.",
                        "<strong><code>int * const p</code></strong> — const pointer to int: The pointer itself is read-only. You cannot do <code>p = &other</code>. But you can write through it: <code>*p = 5</code> is fine. The pointer is fixed; the value it points to is mutable. Less common, used for fixed-address hardware registers.",
                        "<strong><code>const int * const p</code></strong> — const pointer to const int: Both are read-only. You can neither change what <code>p</code> points to nor modify the value through it. The strictest form, used when you have a pointer that should never change in any way."
                    ],
                    code: `#include <stdio.h>

int main() {
    int x = 10;
    int y = 20;
    
    // 1. Pointer to const: data is read-only, pointer is mutable
    const int *p1 = &x;
    // *p1 = 5;    // ERROR: cannot modify *p1
    p1 = &y;       // OK: can change where p1 points
    printf("p1 -> %d\\n", *p1); // 20
    
    // 2. Const pointer: pointer is read-only, data is mutable
    int * const p2 = &x;
    *p2 = 99;      // OK: can modify the value
    // p2 = &y;    // ERROR: cannot change where p2 points
    printf("x is now: %d\\n", x); // 99
    
    // 3. Const pointer to const: both are read-only
    const int * const p3 = &y;
    // *p3 = 5;    // ERROR: cannot modify *p3
    // p3 = &x;    // ERROR: cannot change where p3 points
    printf("p3 -> %d\\n", *p3); // 20
    
    return 0;
}`,
                    output: "p1 -> 20\nx is now: 99\np3 -> 20"
                },
                {
                    title: "const in Function Parameters",
                    content: "The most important practical use of <code>const</code> with pointers is in function signatures. When a function takes a pointer parameter but doesn't need to modify what it points to, mark it <code>const</code>. This does two things: it prevents the function from accidentally modifying the data (enforced by the compiler), and it communicates intent to the caller — they can safely pass a pointer to data they don't want modified.",
                    code: `#include <stdio.h>
#include <string.h>

// 'const char *str' says: this function will NOT modify the string.
// The caller can pass a string literal, a const variable, or a normal
// string - all are safe. Without const, passing a string literal
// would generate a compiler warning.
int countChar(const char *str, char target) {
    int count = 0;
    while (*str != '\\0') {
        if (*str == target) count++;
        str++; // Moving the pointer is fine - it's not const itself
    }
    return count;
}

// This function DOES modify through the pointer - no const here
void toUppercase(char *str) {
    while (*str != '\\0') {
        if (*str >= 'a' && *str <= 'z') {
            *str -= 32; // ASCII lowercase to uppercase
        }
        str++;
    }
}

int main() {
    char text[] = "hello world";
    
    printf("Count of 'l': %d\\n", countChar(text, 'l'));
    
    toUppercase(text);
    printf("Uppercase: %s\\n", text);
    
    return 0;
}`,
                    output: "Count of 'l': 3\nUppercase: HELLO WORLD",
                    tip: "A quick memory aid: read the declaration backwards. <code>const int *p</code> → 'p is a pointer to int that is const' → the int is const. <code>int * const p</code> → 'p is a const pointer to int' → p is const. When you see these in library headers, applying this rule instantly tells you whether a function will modify your data or not — which is exactly the information you need as a caller."
                }
            ]
        },
        {
            id: "loops-internals",
            title: "How Loops Actually Work",
            explanation: "Loops feel like abstract control flow, but the CPU has no concept of 'loop' — it only knows instructions and jumps. Understanding what the machine actually does when you write a loop explains why certain loop patterns are faster than others, what 'loop unrolling' means, how branch prediction works, and why iterating over a 2D array in the wrong order can be several times slower than doing it right.",
            sections: [
                {
                    title: "Loops as Jumps",
                    content: "At the machine code level, every loop compiles down to a comparison and a conditional jump. A <code>for</code> loop incrementing from 0 to N becomes: check if counter < N, if true run the body and jump back to the check, if false fall through to the next instruction. That's it. The elegance of C's loop syntax is entirely in the source code — the CPU just sees a tight sequence of instructions with a jump at the end.",
                    points: [
                        "<strong>Comparison + Jump</strong>: Every loop iteration costs at least one comparison and one branch (the conditional jump back to the top). For small, fast loop bodies, this overhead can be significant relative to the actual work.",
                        "<strong>Loop Unrolling</strong>: Optimizing compilers often unroll loops — instead of jumping back 100 times, they emit the loop body 4 or 8 times in sequence, then jump back only every 4 or 8 iterations. This reduces branch overhead and lets the CPU pipeline more instructions simultaneously. You can do this manually too, but the compiler is usually better at it.",
                        "<strong>Branch Prediction</strong>: Modern CPUs predict which way a branch will go and start executing speculatively before the comparison resolves. For loops, the CPU quickly learns 'this branch almost always jumps back' and pipelines ahead accordingly. The misprediction penalty (the CPU flushed the wrong speculative work) only happens on the very last iteration. This is why tight loops are faster than you might expect from counting individual instructions."
                    ],
                    code: `#include <stdio.h>

// What you write:
int sumNormal(int *arr, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return sum;
}

// What a compiler might generate after loop unrolling (manual version):
// Process 4 elements per iteration, reducing branch count by 4x
int sumUnrolled(int *arr, int n) {
    int sum = 0;
    int i = 0;
    
    // Handle groups of 4
    for (; i <= n - 4; i += 4) {
        sum += arr[i];
        sum += arr[i + 1];
        sum += arr[i + 2];
        sum += arr[i + 3];
    }
    
    // Handle leftover elements
    for (; i < n; i++) {
        sum += arr[i];
    }
    
    return sum;
}

int main() {
    int data[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    printf("Normal:   %d\\n", sumNormal(data, 10));
    printf("Unrolled: %d\\n", sumUnrolled(data, 10));
    return 0;
}`,
                    output: "Normal:   55\nUnrolled: 55",
                    tip: "You almost never need to manually unroll loops — modern compilers with <code>-O2</code> optimization do it automatically and better. The value of understanding unrolling is that it explains *why* the compiler's output can look so different from your source, and why benchmarking unoptimized code is usually meaningless."
                },
                {
                    title: "Cache Locality",
                    content: "RAM is slow compared to the CPU. To bridge this gap, CPUs have small, extremely fast cache memories (L1, L2, L3) that store recently accessed data. When you access a memory location, the CPU doesn't just fetch that one value — it fetches an entire cache line (typically 64 bytes) of surrounding data into the cache. If your next access is nearby in memory, it's already in the cache (a cache hit — fast). If it's somewhere else entirely, the cache has to fetch a new line (a cache miss — slow, ~100x slower than a cache hit). Loops that access memory sequentially are therefore dramatically faster than loops that jump around.",
                    code: `#include <stdio.h>
#include <time.h>

#define N 1024

int matrix[N][N];

// Row-major: accesses memory sequentially (cache-friendly)
long long sumRowMajor() {
    long long sum = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            sum += matrix[i][j]; // Next element is adjacent in memory
    return sum;
}

// Column-major: jumps N*sizeof(int) bytes each step (cache-unfriendly)
long long sumColMajor() {
    long long sum = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            sum += matrix[i][j]; // Next element is N ints away in memory
    return sum;
}

int main() {
    // Initialize matrix
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            matrix[i][j] = i + j;
    
    clock_t start, end;
    
    start = clock();
    long long r = sumRowMajor();
    end = clock();
    printf("Row-major:    %lld ms\\n", (end - start) * 1000 / CLOCKS_PER_SEC);
    
    start = clock();
    long long c = sumColMajor();
    end = clock();
    printf("Column-major: %lld ms\\n", (end - start) * 1000 / CLOCKS_PER_SEC);
    
    return 0;
}`,
                    output: "Row-major:    ~5 ms\nColumn-major: ~40 ms  // (8x slower on typical hardware)",
                    warning: "Cache performance is one of the most impactful and most overlooked optimization factors in C. A naively written algorithm with better cache behavior will frequently outperform a theoretically superior algorithm with poor access patterns. Whenever you write a nested loop over a 2D array, check: are you iterating in the order C stores the data (row-major)? If not, strongly consider restructuring the loop before reaching for any other optimization."
                }
            ]
        },
        {
            id: "atomics",
            title: "Atomics and Concurrency (C11)",
            explanation: "Modern programs often run multiple threads simultaneously. When two threads access the same variable at the same time — one reading, one writing — without any coordination, you have a race condition. The result is undefined behavior: you might read a half-written value, or the compiler might reorder operations in ways that break your assumptions entirely. C11 introduced <code>_Atomic</code> types and the <code>&lt;stdatomic.h&gt;</code> header to give you operations that are guaranteed to complete without interference from other threads.",
            sections: [
                {
                    title: "The Race Condition Problem",
                    content: "A race condition occurs when the correctness of a program depends on the timing of two threads' operations — and the timing isn't guaranteed. The classic example: two threads both incrementing a shared counter. Incrementing looks like one operation in C (<code>counter++</code>), but it compiles to at least three machine instructions: load the value from memory, add 1, store the result back. If two threads interleave these steps, both can load the same value, both increment it, and both write back — resulting in one increment instead of two. No error is reported. The counter is just wrong.",
                    points: [
                        "<strong>Non-atomic read-modify-write</strong>: Any operation that reads a value, modifies it, and writes it back — like <code>++</code>, <code>+=</code>, <code>|=</code> — is non-atomic by default. It's multiple machine instructions that can be interrupted.",
                        "<strong>Compiler reordering</strong>: The compiler is allowed to reorder operations that don't depend on each other. In single-threaded code this is always safe. In multithreaded code, reordering can break programs that rely on operations happening in a specific order across threads.",
                        "<strong>CPU reordering</strong>: Even after the compiler, the CPU itself may reorder memory operations for performance. This is invisible in single-threaded programs but causes real problems in multithreaded ones without memory barriers."
                    ],
                    code: `#include <stdio.h>
#include <threads.h> // C11 threads (requires -lpthread on Linux)

// Shared counter - NOT atomic (demonstrates the problem)
int unsafe_counter = 0;

int increment_thread(void *arg) {
    for (int i = 0; i < 100000; i++) {
        unsafe_counter++; // READ - ADD - WRITE: three steps, not atomic!
        // Another thread can interrupt between any of these steps
    }
    return 0;
}

int main() {
    thrd_t t1, t2;
    
    thrd_create(&t1, increment_thread, NULL);
    thrd_create(&t2, increment_thread, NULL);
    
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);
    
    // Expected: 200000. Actual: something less, varies each run.
    printf("Final counter: %d\\n", unsafe_counter);
    printf("Expected:      200000\\n");
    
    return 0;
}`,
                    output: "Final counter: 143271  // Different every run\nExpected:      200000",
                    warning: "Race conditions are among the hardest bugs to debug because they're non-deterministic. The program may run correctly 999 times out of 1000, then fail once under load. They also disappear under debuggers, which change thread timing. If your program uses multiple threads and shares mutable state, assume you have race conditions until you've proven otherwise with proper synchronization."
                },
                {
                    title: "Atomic Types (_Atomic)",
                    content: "C11's solution is <code>_Atomic</code> — a type qualifier that makes operations on a variable happen as a single, indivisible step. No thread can see a partial operation on an atomic variable. The compiler and CPU are both required to ensure this. The <code>&lt;stdatomic.h&gt;</code> header provides type aliases (<code>atomic_int</code>, <code>atomic_bool</code>, etc.) and explicit atomic operation functions for when you need more control than the basic operators provide.",
                    points: [
                        "<strong><code>_Atomic int</code> or <code>atomic_int</code></strong>: Declares an atomic integer. All reads and writes are guaranteed to be indivisible — no thread sees a half-updated value.",
                        "<strong>Atomic operations on <code>_Atomic</code> variables</strong>: Using <code>++</code>, <code>+=</code>, etc. on an <code>_Atomic</code> variable automatically makes those operations atomic. The compiler generates the appropriate hardware instructions (lock-prefixed instructions on x86, load-linked/store-conditional on ARM).",
                        "<strong><code>atomic_fetch_add</code>, <code>atomic_load</code>, <code>atomic_store</code></strong>: Explicit atomic operation functions from <code>&lt;stdatomic.h&gt;</code>. Use these when you need to perform an operation and get the old value, or when you need to specify a memory ordering.",
                        "<strong>Memory ordering</strong>: Atomic operations can specify how they interact with surrounding non-atomic operations. <code>memory_order_seq_cst</code> (the default) is the strictest and safest. <code>memory_order_relaxed</code> is the fastest but gives the fewest guarantees. For most application code, the default is fine."
                    ],
                    code: `#include <stdio.h>
#include <stdatomic.h>
#include <threads.h>

// Atomic counter - operations are now indivisible
atomic_int safe_counter = 0;

int safe_increment(void *arg) {
    for (int i = 0; i < 100000; i++) {
        atomic_fetch_add(&safe_counter, 1); // Atomic increment
        // Equivalent to safe_counter++ but guaranteed atomic
    }
    return 0;
}

int main() {
    thrd_t t1, t2;
    
    thrd_create(&t1, safe_increment, NULL);
    thrd_create(&t2, safe_increment, NULL);
    
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);
    
    // Always exactly 200000
    printf("Final counter: %d\\n", atomic_load(&safe_counter));
    printf("Expected:      200000\\n");
    
    return 0;
}`,
                    output: "Final counter: 200000\nExpected:      200000",
                    tip: "Atomics solve the race condition problem for single variables. They do not solve the coordination problem for multi-step operations. If you need to read a counter, check its value, and then update it based on that check — all as one unit — you need a mutex, not just an atomic. Atomics are for the simplest cases: counters, flags, single-variable state. For anything more complex, reach for a proper synchronization primitive."
                }
            ]
        },
        {
            id: "stdlib-deep",
            title: "Standard Library Deep Dive",
            explanation: "The C standard library is a collection of pre-compiled, battle-tested functions that come with every C compiler. Learning which functions exist and what they actually do well prevents you from reinventing things badly. This lesson covers the most practically useful functions across four headers you'll reach for constantly: <code>&lt;string.h&gt;</code> for memory operations, <code>&lt;stdlib.h&gt;</code> for sorting, searching, and conversions, and <code>&lt;math.h&gt;</code> for mathematics.",
            sections: [
                {
                    title: "Memory Functions (string.h)",
                    content: "Beyond the string functions covered earlier, <code>&lt;string.h&gt;</code> contains functions that operate on raw memory — bytes, not strings. These are among the fastest ways to copy, move, or fill blocks of memory in C because they're typically implemented in heavily optimized assembly.",
                    points: [
                        "<code>memcpy(dst, src, n)</code>: Copies exactly <code>n</code> bytes from <code>src</code> to <code>dst</code>. The two regions must NOT overlap. It's undefined behavior if they do. This is the fastest general-purpose memory copy — use it whenever you know the regions are separate.",
                        "<code>memmove(dst, src, n)</code>: Copies <code>n</code> bytes, but handles overlapping source and destination correctly. Slightly slower than <code>memcpy</code> because it has to determine the direction of copy to avoid overwriting data before it's read. Use this whenever the regions might overlap.",
                        "<code>memset(ptr, byte, n)</code>: Fills <code>n</code> bytes starting at <code>ptr</code> with the value <code>byte</code>. The byte value is an <code>int</code> but only the low 8 bits are used. The most common uses: <code>memset(arr, 0, sizeof(arr))</code> to zero a buffer, and <code>memset(ptr, 0xFF, n)</code> to fill with 0xFF. Note: <code>memset</code> works on bytes, so <code>memset(arr, 1, sizeof(arr))</code> fills each byte with 1, not each int with 1.",
                        "<code>memcmp(a, b, n)</code>: Compares <code>n</code> bytes of two memory regions. Returns 0 if identical, negative if <code>a</code> < <code>b</code>, positive if <code>a</code> > <code>b</code>. Faster than a manual byte-by-byte loop."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

int main() {
    // memcpy: fast copy, no overlap allowed
    char src[] = "Hello, World!";
    char dst[20];
    memcpy(dst, src, strlen(src) + 1); // +1 for null terminator
    printf("memcpy: %s\\n", dst);
    
    // memmove: safe overlap copy
    char buffer[] = "ABCDE";
    // Shift right by 1 (overlapping regions!)
    memmove(buffer + 1, buffer, 4);
    buffer[0] = 'Z';
    printf("memmove: %s\\n", buffer); // ZABCD
    
    // memset: fill with a value
    int arr[5];
    memset(arr, 0, sizeof(arr)); // Zero all bytes
    printf("memset zero: ");
    for (int i = 0; i < 5; i++) printf("%d ", arr[i]); // 0 0 0 0 0
    printf("\\n");
    
    // memcmp: compare raw bytes
    char a[] = "apple";
    char b[] = "apple";
    char c[] = "mango";
    printf("memcmp same:  %d\\n", memcmp(a, b, 5)); // 0
    printf("memcmp diff:  %d\\n", memcmp(a, c, 5)); // negative
    
    return 0;
}`,
                    output: "memcpy: Hello, World!\nmemmove: ZABCD\nmemset zero: 0 0 0 0 0 \nmemcmp same:  0\nmemcmp diff:  -12"
                },
                {
                    title: "Sorting and Searching (stdlib.h)",
                    content: "<code>qsort</code> and <code>bsearch</code> are the standard library's general-purpose sort and binary search. They use <code>void*</code> parameters to work with any data type, which means they take a comparator function as a parameter — this is function pointers in practical use.",
                    points: [
                        "<code>qsort(base, n, size, cmp)</code>: Sorts an array in place. <code>base</code> is the start of the array, <code>n</code> is the number of elements, <code>size</code> is the byte size of each element (<code>sizeof</code>), and <code>cmp</code> is a comparator function. The comparator receives two <code>const void*</code> pointers, casts them to the actual type, and returns negative/zero/positive.",
                        "<code>bsearch(key, base, n, size, cmp)</code>: Binary searches a sorted array for <code>key</code>. Returns a <code>void*</code> to the found element, or <code>NULL</code> if not found. The array MUST be sorted in the same order as your comparator defines — searching an unsorted array is undefined behavior.",
                        "<strong>The comparator contract</strong>: Must return negative if first < second, 0 if equal, positive if first > second. Returning the wrong sign reverses the sort order. A common trick for integers: <code>return *(int*)a - *(int*)b</code> — but watch out for overflow if the values can be very large or very negative."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Comparator for integers: ascending order
int compareInts(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
    // Negative if a < b, 0 if equal, positive if a > b
}

// Comparator for strings
int compareStrings(const void *a, const void *b) {
    return strcmp(*(char**)a, *(char**)b);
}

int main() {
    // Sort integers
    int nums[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(nums) / sizeof(nums[0]);
    
    qsort(nums, n, sizeof(int), compareInts);
    
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", nums[i]);
    printf("\\n");
    
    // Binary search (array must be sorted first!)
    int target = 25;
    int *found = bsearch(&target, nums, n, sizeof(int), compareInts);
    
    if (found) {
        printf("Found %d at index %ld\\n", target, found - nums);
    } else {
        printf("%d not found\\n", target);
    }
    
    // Sort strings
    char *words[] = {"banana", "apple", "cherry", "date"};
    int wn = 4;
    qsort(words, wn, sizeof(char*), compareStrings);
    
    printf("Words: ");
    for (int i = 0; i < wn; i++) printf("%s ", words[i]);
    printf("\\n");
    
    return 0;
}`,
                    output: "Sorted: 11 12 22 25 34 64 90 \nFound 25 at index 3\nWords: apple banana cherry date "
                },
                {
                    title: "String-to-Number Conversions (stdlib.h)",
                    content: "Reading numbers from command-line arguments or text files means dealing with strings that need to become actual numeric types. <code>atoi</code> is the simple version; <code>strtol</code> and friends are the correct version for any real code.",
                    points: [
                        "<code>atoi(str)</code>: Converts a string to <code>int</code>. Fast and simple, but has no error detection — if the string isn't a valid number, it returns 0, which is indistinguishable from an actual 0. Avoid in any code that needs to validate input.",
                        "<code>strtol(str, endptr, base)</code>: Converts a string to <code>long</code> with full error detection. <code>endptr</code> is set to point to the first character that wasn't part of the number — if it points to the start of the string, no conversion happened. <code>base</code> is the numeric base (10 for decimal, 16 for hex, 0 to auto-detect from prefix). Check <code>errno</code> for overflow.",
                        "<code>strtod(str, endptr)</code>: Same as <code>strtol</code> but converts to <code>double</code>. Use this instead of <code>atof</code> for the same error-detection reasons.",
                        "<code>sprintf(buf, fmt, ...)</code> / <code>snprintf</code>: Convert numbers back to strings. <code>snprintf</code> is the safe version — it takes a max size and never overflows the buffer. Always use <code>snprintf</code> over <code>sprintf</code>."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

int main() {
    // atoi: simple but blind to errors
    printf("atoi(\\"42\\")    = %d\\n", atoi("42"));
    printf("atoi(\\"abc\\")   = %d\\n", atoi("abc"));   // 0, but was it an error?
    printf("atoi(\\"3x9\\")   = %d\\n", atoi("3x9"));   // 3, silently stops at 'x'
    
    // strtol: proper error handling
    char *endptr;
    errno = 0;
    
    long val = strtol("12345", &endptr, 10);
    if (endptr == "12345" || *endptr != '\\0') {
        printf("Conversion failed\\n");
    } else {
        printf("strtol: %ld\\n", val);
    }
    
    // Detect non-numeric input
    char *input = "42abc";
    val = strtol(input, &endptr, 10);
    printf("strtol(\\"42abc\\"): val=%ld, stopped at '%c'\\n", val, *endptr);
    
    // Number to string with snprintf
    char buf[32];
    int n = snprintf(buf, sizeof(buf), "Value: %d", 9999);
    printf("snprintf produced: \\"%s\\" (%d chars)\\n", buf, n);
    
    return 0;
}`,
                    output: "atoi(\"42\")    = 42\natoi(\"abc\")   = 0\natoi(\"3x9\")   = 3\nstrtol: 12345\nstrtol(\"42abc\"): val=42, stopped at 'a'\nsnprintf produced: \"Value: 9999\" (12 chars)",
                    tip: "The rule of thumb: use <code>strtol</code>/<code>strtod</code> for any input you didn't generate yourself. If you're parsing numbers from user input, a file, or a network packet, you need to know when conversion fails. <code>atoi</code> is fine for quick throwaway code where the input is guaranteed correct — like converting a hardcoded constant."
                },
                {
                    title: "Math Functions (math.h)",
                    content: "The <code>&lt;math.h&gt;</code> header provides the standard mathematical functions. On most systems you need to link the math library explicitly with <code>-lm</code> at compile time (<code>gcc program.c -lm</code>). All functions operate on <code>double</code> by default; <code>float</code> versions have an <code>f</code> suffix (<code>sqrtf</code>, <code>fabsf</code>).",
                    points: [
                        "<code>sqrt(x)</code>: Square root. <code>pow(x, y)</code>: x raised to the power y — slower than manual multiplication for small integer exponents; prefer <code>x * x</code> over <code>pow(x, 2)</code>.",
                        "<code>fabs(x)</code>: Absolute value for doubles. Do NOT use the integer <code>abs()</code> from <code>&lt;stdlib.h&gt;</code> on floating-point numbers — it silently truncates to int first.",
                        "<code>floor(x)</code>: Rounds down to the nearest integer (toward negative infinity). <code>ceil(x)</code>: Rounds up. <code>round(x)</code>: Rounds to nearest, ties away from zero.",
                        "<code>sin(x)</code>, <code>cos(x)</code>, <code>tan(x)</code>: Trigonometric functions. Arguments are in radians, not degrees. To convert: <code>radians = degrees * M_PI / 180.0</code>. <code>M_PI</code> is defined in <code>&lt;math.h&gt;</code> on most platforms (it's a POSIX extension, not strict ISO C).",
                        "<code>log(x)</code>: Natural logarithm (base e). <code>log2(x)</code>: Base-2 log. <code>log10(x)</code>: Base-10 log. <code>exp(x)</code>: e raised to x."
                    ],
                    code: `#include <stdio.h>
#include <math.h>
// Compile with: gcc program.c -lm

int main() {
    printf("sqrt(16)      = %.1f\\n", sqrt(16.0));       // 4.0
    printf("pow(2, 10)    = %.0f\\n", pow(2, 10));       // 1024
    printf("fabs(-3.14)   = %.2f\\n", fabs(-3.14));      // 3.14
    
    printf("floor(3.7)    = %.1f\\n", floor(3.7));       // 3.0
    printf("ceil(3.2)     = %.1f\\n", ceil(3.2));        // 4.0
    printf("round(3.5)    = %.1f\\n", round(3.5));       // 4.0
    printf("round(3.4)    = %.1f\\n", round(3.4));       // 3.0
    
    // Trig: convert 45 degrees to radians
    double angle = 45.0 * M_PI / 180.0;
    printf("sin(45 deg)   = %.4f\\n", sin(angle));       // 0.7071
    printf("cos(45 deg)   = %.4f\\n", cos(angle));       // 0.7071
    
    printf("log(M_E)      = %.1f\\n", log(M_E));         // 1.0 (ln(e) = 1)
    printf("log2(1024)    = %.1f\\n", log2(1024));       // 10.0
    printf("log10(1000)   = %.1f\\n", log10(1000));      // 3.0
    
    return 0;
}`,
                    output: "sqrt(16)      = 4.0\npow(2, 10)    = 1024\nfabs(-3.14)   = 3.14\nfloor(3.7)    = 3.0\nceil(3.2)     = 4.0\nround(3.5)    = 4.0\nround(3.4)    = 3.0\nsin(45 deg)   = 0.7071\ncos(45 deg)   = 0.7071\nlog(M_E)      = 1.0\nlog2(1024)    = 10.0\nlog10(1000)   = 3.0",
                    warning: "Floating-point math is never exact. <code>0.1 + 0.2</code> in double precision is not exactly <code>0.3</code> — it's <code>0.30000000000000004</code>. Never compare floating-point results with <code>==</code>. Instead, check if the absolute difference is smaller than an acceptable tolerance: <code>if (fabs(a - b) < 1e-9)</code>. This also means <code>sqrt(x) * sqrt(x) == x</code> may be false for many values of x."
                }
            ]
        },
        {
            id: "c23-stdlib",
            title: "C23 Standard Library Additions: strdup, stdbit.h, and Checked Arithmetic",
            explanation: "C23 doesn't just add syntax — it adds substantial new standard library functionality. <code>strdup</code> and <code>strndup</code> are finally standard (they've been POSIX for decades but not part of C). <code>&lt;stdbit.h&gt;</code> standardizes bit-manipulation utilities previously implemented differently on every platform. And checked integer arithmetic macros let you detect overflow without undefined behavior.",
            sections: [
                {
                    title: "strdup and strndup (C23)",
                    content: "These functions duplicate a string by allocating memory and copying. They've existed on POSIX systems for decades but were non-standard extensions. C23 finally makes them part of the standard library. The returned pointer must be freed with <code>free()</code>.",
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    const char *original = "Hello, Modern C!";

    // strdup: allocates strlen(s)+1 bytes and copies s
    char *copy = strdup(original);
    if (!copy) { perror("strdup"); return 1; }

    printf("Original: %s\\n", original);
    printf("Copy:     %s\\n", copy);
    printf("Same ptr? %s\\n", original == copy ? "yes" : "no");

    // Modify copy — original is unaffected
    copy[7] = 'X';
    printf("Modified: %s\\n", copy);
    printf("Original: %s\\n", original);
    free(copy);

    // strndup: copies at most n bytes, always null-terminates
    const char *long_str = "This is a very long string";
    char *prefix = strndup(long_str, 7);  // "This is"
    if (!prefix) { perror("strndup"); return 1; }
    printf("\\nFirst 7 chars: '%s'\\n", prefix);
    free(prefix);

    return 0;
}`,
                    output: `Original: Hello, Modern C!
Copy:     Hello, Modern C!
Same ptr? no
Modified: Hello, Xodern C!
Original: Hello, Modern C!

First 7 chars: 'This is'`,
                    tip: "Always check the return value of <code>strdup</code> — it calls <code>malloc</code> internally and returns <code>NULL</code> on allocation failure. The allocated string must be freed exactly once. A common pattern: <code>char *s = strdup(input); if (!s) return ENOMEM;</code>"
                },
                {
                    title: "<stdbit.h>: Standard Bit Utilities (C23)",
                    content: "Before C23, counting bits, finding the highest set bit, or checking power-of-two status required hand-rolled implementations or compiler-specific builtins like GCC's <code>__builtin_popcount</code>. C23's <code>&lt;stdbit.h&gt;</code> standardizes these as portable, type-generic functions.",
                    code: `#include <stdio.h>
#include <stdbit.h>    // C23 bit utilities
#include <stdint.h>

int main(void) {
    uint32_t x = 0b10110100110101001011010011010100;

    // Count set bits (population count / Hamming weight)
    printf("stdc_count_ones(x)     = %u\\n", stdc_count_ones(x));
    printf("stdc_count_zeros(x)    = %u\\n", stdc_count_zeros(x));

    // Leading/trailing zeros and ones
    printf("stdc_leading_zeros(x)  = %u\\n", stdc_leading_zeros(x));
    printf("stdc_trailing_zeros(x) = %u\\n", stdc_trailing_zeros(x));
    printf("stdc_leading_ones(x)   = %u\\n", stdc_leading_ones(x));
    printf("stdc_trailing_ones(x)  = %u\\n", stdc_trailing_ones(x));

    // Bit width: position of highest set bit + 1
    printf("stdc_bit_width(x)      = %u\\n", stdc_bit_width(x));

    // Floor/ceil to power of two
    uint32_t v = 100;
    printf("\\nFor v = %u:\\n", v);
    printf("stdc_bit_floor(v)      = %u\\n", stdc_bit_floor(v));   // 64
    printf("stdc_bit_ceil(v)       = %u\\n", stdc_bit_ceil(v));    // 128

    // Check power of two
    printf("stdc_has_single_bit(64)  = %d\\n", stdc_has_single_bit(64u));
    printf("stdc_has_single_bit(100) = %d\\n", stdc_has_single_bit(100u));

    return 0;
}`,
                    output: `stdc_count_ones(x)     = 16
stdc_count_zeros(x)    = 16
stdc_leading_zeros(x)  = 0
stdc_trailing_zeros(x) = 2
stdc_leading_ones(x)   = 1
stdc_trailing_ones(x)  = 0
stdc_bit_width(x)      = 32

For v = 100:
stdc_bit_floor(v)      = 64
stdc_bit_ceil(v)       = 128
stdc_has_single_bit(64)  = 1
stdc_has_single_bit(100) = 0`,
                    tip: "These functions are type-generic — they work on any unsigned integer type. The compiler selects the right underlying implementation based on argument type. Before C23, you had to use <code>__builtin_popcount</code> for <code>int</code>, <code>__builtin_popcountl</code> for <code>long</code>, etc. Now one name handles all."
                },
                {
                    title: "Checked Integer Arithmetic (C23)",
                    content: "Signed integer overflow is undefined behavior in C. On any given platform it usually wraps, but the compiler is allowed to assume it never happens and optimize away overflow checks. C23 introduces checked arithmetic functions from <code>&lt;stdckdint.h&gt;</code> that perform arithmetic and report whether overflow occurred — without invoking undefined behavior.",
                    code: `#include <stdio.h>
#include <stdckdint.h>   // C23 checked arithmetic
#include <limits.h>

// Safe addition — returns true if overflow occurred
bool safe_add_int(int a, int b, int *result) {
    return ckd_add(result, a, b);  // returns true on overflow
}

int main(void) {
    int result;

    // Normal additions — no overflow
    if (ckd_add(&result, 100, 200)) {
        printf("100 + 200: OVERFLOW\\n");
    } else {
        printf("100 + 200 = %d  (no overflow)\\n", result);
    }

    // Overflow case: INT_MAX + 1
    if (ckd_add(&result, INT_MAX, 1)) {
        printf("INT_MAX + 1: OVERFLOW detected safely!\\n");
        printf("  (result is: %d — but we know it overflowed)\\n", result);
    } else {
        printf("INT_MAX + 1 = %d\\n", result);
    }

    // ckd_sub and ckd_mul work the same way
    if (ckd_mul(&result, 100000, 100000)) {
        printf("100000 * 100000: OVERFLOW (exceeds INT_MAX = %d)\\n", INT_MAX);
    } else {
        printf("100000 * 100000 = %d\\n", result);
    }

    // Works across different integer types
    long long big;
    if (ckd_add(&big, (long long)INT_MAX, (long long)INT_MAX)) {
        printf("INT_MAX + INT_MAX: OVERFLOW for long long\\n");
    } else {
        printf("INT_MAX + INT_MAX = %lld  (fits in long long)\\n", big);
    }

    return 0;
}`,
                    output: `100 + 200 = 300  (no overflow)
INT_MAX + 1: OVERFLOW detected safely!
  (result is: -2147483648 — but we know it overflowed)
100000 * 100000: OVERFLOW (exceeds INT_MAX = 2147483647)
INT_MAX + INT_MAX = 4294967294  (fits in long long)`,
                    warning: "Before C23, detecting integer overflow required convoluted workarounds like <code>if (a > INT_MAX - b)</code> — which themselves are easy to get wrong. The <code>ckd_*</code> functions handle all the edge cases correctly including different types, and are guaranteed not to invoke undefined behavior even when overflow occurs. Use them whenever you need to verify arithmetic on untrusted input (network data, file sizes, user counts)."
                },
                {
                    title: "memccpy and Other C23 String Improvements",
                    content: "C23 also standardizes <code>memccpy</code> (copy until a byte is found), makes <code>gets</code> finally removed from the standard (it was already deprecated in C11), and clarifies the behavior of <code>strtok_r</code>. The <code>memccpy</code> function is particularly useful for efficiently copying with a sentinel byte.",
                    code: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main(void) {
    // memccpy: copy bytes until character c is found (or n bytes)
    // Returns pointer to byte after c in dest, or NULL if c not found
    char dest[64] = {0};
    const char *src = "Hello, World! More text here";

    // Copy up to and including the '!' character
    char *end = memccpy(dest, src, '!', sizeof(dest));
    if (end) {
        *end = '\\0';   // Null-terminate after the found character
        printf("Copied up to '!': %s\\n", dest);
        printf("Remaining: %s\\n", src + (end - dest));
    }

    // Practical use: building a string token by token
    char buffer[128] = {0};
    char *pos = buffer;
    size_t remaining = sizeof(buffer);

    const char *words[] = {"Hello", " ", "World", NULL};
    for (int i = 0; words[i]; i++) {
        // Find the null terminator in each word and copy to it
        char *next = memccpy(pos, words[i], '\\0', remaining);
        if (!next) break;  // Buffer full
        pos = next - 1;    // Back up over the null terminator
        remaining = sizeof(buffer) - (size_t)(pos - buffer);
    }
    printf("Built string: '%s'\\n", buffer);

    return 0;
}`,
                    output: `Copied up to '!': Hello, World!
Remaining:  More text here
Built string: 'Hello World'`
                }
            ]
        },
        {
            id: "what-next",
            title: "What Next? Life After This Curriculum",
            explanation: "You've covered the language from first principles through C23. That's the foundation — but C mastery is built through practice on real problems, reading real codebases, and using the tools the C ecosystem actually relies on. This lesson is a map of where to go from here.",
            sections: [
                {
                    title: "Projects That Will Teach You More Than Any Tutorial",
                    content: "The fastest path to genuine C proficiency is building things with a hard constraint: no external libraries, no shortcuts. These projects force you to confront memory management, data structures, and system interfaces directly.",
                    points: [
                        "<strong>Write a memory allocator</strong>: Implement <code>malloc</code>, <code>free</code>, and <code>realloc</code> from scratch using <code>sbrk</code> or <code>mmap</code>. You'll understand heap layout, fragmentation, alignment, and why free-list management is hard. This is the project that makes pointers click permanently.",
                        "<strong>Write a shell</strong>: A basic Unix shell (<code>fork</code>, <code>exec</code>, <code>pipe</code>, <code>wait</code>) teaches process management, file descriptors, and signal handling better than any textbook. The classic tutorial is Stephen Brennan's 'Write a Shell in C'.",
                        "<strong>Write a hash table</strong>: A generic hash table with open addressing and a load factor resize teaches you type-generic C design (function pointers as comparators and hash functions), struct design, and amortized complexity.",
                        "<strong>Write a JSON parser</strong>: A recursive descent parser for a small data format (JSON or a simple expression language) teaches you string processing, memory management for tree structures, and error handling — and gives you something actually useful.",
                        "<strong>Write a tiny interpreter</strong>: A stack-based bytecode VM for a tiny language (even just arithmetic with variables) is the project that teaches you everything about how C's own runtime works."
                    ]
                },
                {
                    title: "Essential Reference Material",
                    content: "These are the resources that working C programmers actually use — not tutorials for beginners, but references and deeper material you'll return to repeatedly.",
                    points: [
                        "<strong>cppreference.com</strong> — The best online C standard library reference. More accurate and readable than the actual standard. Bookmark it. Every function, every macro, with examples and notes on undefined behavior.",
                        "<strong>The C Programming Language (K&R)</strong> — Kernighan and Ritchie. Short, dense, and still relevant. The exercises in Chapter 8 (the Unix system interface) are worth doing even now.",
                        "<strong>Computer Systems: A Programmer's Perspective (CSAPP)</strong> — Bryant and O'Hallaron. The book that explains why C works the way it does: data representation, the memory hierarchy, linking, exceptional control flow, virtual memory, concurrency. Read Chapters 2 and 3 at minimum.",
                        "<strong>Godbolt Compiler Explorer (godbolt.org)</strong> — Paste C code, see the assembly output from GCC, Clang, and MSVC side by side. Essential for understanding what the optimizer actually does with your code.",
                        "<strong>The C17/C23 standard drafts</strong> — Freely available online. You don't read them cover to cover, but you do ctrl-F specific clauses when you need the authoritative answer about behavior.",
                        "<strong>Modern C (Gustedt)</strong> — The book this curriculum is based on. Now that you've done the course, read it cover to cover. The deeper treatment of the abstract machine, strict aliasing, and type-generic programming will land differently."
                    ]
                },
                {
                    title: "Tools Every C Developer Needs",
                    content: "Knowing the language is necessary but not sufficient. These tools are what professional C development actually looks like.",
                    points: [
                        "<strong>GCC and Clang</strong>: Use both. They have different warnings and different sanitizer diagnostics. A program that compiles cleanly under both with <code>-Wall -Wextra -Wpedantic</code> is a much stronger signal of correctness than one that compiles under just one.",
                        "<strong>AddressSanitizer + UBSanitizer</strong>: <code>-fsanitize=address,undefined</code>. If you take away one habit from this curriculum, let it be: always run your test suite with sanitizers enabled.",
                        "<strong>Valgrind</strong>: For leak checking when ASan's overhead is too high, and for profiling with Callgrind. <code>valgrind --leak-check=full --show-leak-kinds=all ./prog</code>.",
                        "<strong>gdb</strong>: The GNU debugger. Learn 10 commands: <code>run</code>, <code>break</code>, <code>next</code>, <code>step</code>, <code>print</code>, <code>backtrace</code>, <code>info locals</code>, <code>watch</code>, <code>continue</code>, <code>quit</code>. That's enough to debug 90% of crashes.",
                        "<strong>clang-format</strong>: Automated code formatting. Stop arguing about style; just run the formatter. A consistent style makes code reviews faster and diffs cleaner.",
                        "<strong>clang-tidy</strong>: A linter that catches issues beyond what compiler warnings flag — potential null dereferences, performance anti-patterns, and modernization suggestions."
                    ]
                },
                {
                    title: "Where C is Actually Used",
                    content: "Knowing where C lives in the real world helps you pick the right next projects and understand why the language is designed the way it is.",
                    points: [
                        "<strong>Operating system kernels</strong>: Linux, the BSDs, and most embedded RTOSes are written in C. Reading the Linux kernel source is humbling and educational — start with <code>kernel/sched/core.c</code> or a simple driver.",
                        "<strong>Language runtimes</strong>: CPython, Ruby MRI, PHP's Zend engine, and Lua are C. If you want to understand how interpreted languages work, read their source.",
                        "<strong>Databases</strong>: PostgreSQL and SQLite are excellent C codebases. SQLite in particular is exceptionally well-commented and is one of the most thoroughly tested C programs in existence.",
                        "<strong>Embedded systems</strong>: Microcontrollers (AVR, ARM Cortex-M, ESP32) are almost exclusively programmed in C. If you want to write C that controls hardware, Arduino's core is C with a thin C++ wrapper.",
                        "<strong>Network infrastructure</strong>: nginx, Redis, memcached, and most network daemons are C. Performance-critical, concurrent, and heavily reliant on the system call interface."
                    ],
                    tip: "Pick one real C codebase and read it. Not all of it — pick a file or subsystem that interests you and understand every line. SQLite's <code>btree.c</code>, Redis's <code>dict.c</code>, or Linux's <code>mm/slub.c</code>. Reading real code written by experts teaches things that no tutorial can."
                }
            ]
        }
    ],

    quiz: [
        {
            question: "What does `(float)a / b` do when a and b are both int?",
            options: ["Integer division", "Forces float division", "Rounds the result", "Causes a compiler error"],
            answer: 1,
            explanation: "(float)a casts a to float before the division, so the result is floating-point. Without the cast, int/int gives integer division."
        },
        {
            question: "In `int main(int argc, char *argv[])`, what is `argv[0]`?",
            options: ["The first user argument", "The program name", "The argument count", "Always NULL"],
            answer: 1,
            explanation: "argv[0] is always the program's name (or path). User-provided arguments start at argv[1]."
        },
        {
            question: "What does `const int *p` mean?",
            options: ["p cannot be reassigned", "The value at *p cannot be modified", "Both p and *p are const", "p must be initialized"],
            answer: 1,
            explanation: "const int *p means the int pointed to is read-only — you cannot write *p. The pointer p itself can be reassigned to point elsewhere."
        },
        {
            question: "What is the key difference between memcpy and memmove?",
            options: ["memcpy is for strings only", "memmove handles overlapping regions", "memcpy zeros memory first", "memmove is always faster"],
            answer: 1,
            explanation: "memmove handles overlapping source and destination regions correctly by copying through a temporary buffer. memcpy requires non-overlapping regions (declared restrict)."
        },
        {
            question: "What does loop unrolling do?",
            options: ["Removes the loop entirely", "Reduces the number of branch instructions", "Makes the loop run backwards", "Increases loop iterations"],
            answer: 1,
            explanation: "Loop unrolling copies the loop body multiple times to reduce the number of branch/increment instructions per iteration, improving throughput at the cost of code size."
        },
        {
            question: "What is a race condition?",
            options: ["A performance problem in loops", "A bug caused by two threads accessing shared data without synchronization", "A memory leak in threads", "A type mismatch error"],
            answer: 1,
            explanation: "A race condition occurs when two threads read and write shared data concurrently without synchronization, producing results that depend on thread scheduling timing."
        },
        {
            question: "Which function should you use instead of atoi for reliable error detection?",
            options: ["itoa", "strtol", "scanf", "sscanf"],
            answer: 1,
            explanation: "strtol returns the parsed value and sets endptr to point past the last consumed character, and sets errno on overflow. atoi silently returns 0 on any error."
        },
        {
            question: "What does `volatile` prevent the compiler from doing?",
            options: ["Writing to that variable", "Caching or reordering accesses to that variable", "Using that variable in expressions", "Allocating the variable on the stack"],
            answer: 1,
            explanation: "volatile prevents the compiler from caching the variable's value in a register or reordering accesses. Every read and write goes to the actual memory location."
        }
    ],

    practice: [
        {
            title: "Safe Number Parser",
            difficulty: "easy",
            problem: "Write a function `parseInteger(const char *str, int *result)` that converts a string to an integer using `strtol`. Return 1 on success, 0 on failure (non-numeric input or empty string). Test it with '42', 'abc', '123xyz', and ''.",
            hint: "Check both that endptr moved from the start AND that it now points to the null terminator.",
            solution: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

int parseInteger(const char *str, int *result) {
    if (str == NULL || *str == '\\0') return 0;
    
    char *endptr;
    errno = 0;
    long val = strtol(str, &endptr, 10);
    
    // Failed if: no digits consumed, or leftover non-digit chars
    if (endptr == str || *endptr != '\\0') return 0;
    
    *result = (int)val;
    return 1;
}

int main() {
    int val;
    const char *tests[] = {"42", "abc", "123xyz", "", "-99", "0"};
    int n = sizeof(tests) / sizeof(tests[0]);
    
    for (int i = 0; i < n; i++) {
        if (parseInteger(tests[i], &val)) {
            printf("'%s' -> %d\\n", tests[i], val);
        } else {
            printf("'%s' -> INVALID\\n", tests[i]);
        }
    }
    return 0;
}`
        },
        {
            title: "Generic Array Sorter",
            difficulty: "medium",
            problem: "Use `qsort` to sort an array of `struct Student` (name and GPA) by GPA in descending order. Print the sorted list.",
            hint: "The comparator receives const void* pointers. Cast them to struct Student* and compare the gpa fields. Reverse the sign for descending order.",
            solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char name[20];
    float gpa;
} Student;

int byGPADesc(const void *a, const void *b) {
    const Student *sa = (const Student*)a;
    const Student *sb = (const Student*)b;
    // Descending: if sa->gpa > sb->gpa, return negative (sa comes first)
    if (sa->gpa > sb->gpa) return -1;
    if (sa->gpa < sb->gpa) return  1;
    return 0;
}

int main() {
    Student students[] = {
        {"Alice",   3.5},
        {"Bob",     3.8},
        {"Charlie", 3.2},
        {"Diana",   3.9},
        {"Eve",     3.6}
    };
    int n = sizeof(students) / sizeof(students[0]);
    
    qsort(students, n, sizeof(Student), byGPADesc);
    
    printf("Rank  Name       GPA\\n");
    printf("----  ---------  ---\\n");
    for (int i = 0; i < n; i++) {
        printf("%2d.   %-10s %.1f\\n", i+1, students[i].name, students[i].gpa);
    }
    return 0;
}`
        },
        {
            title: "Command-Line Calculator",
            difficulty: "medium",
            problem: "Write a program that takes three command-line arguments: two numbers and an operator (+, -, *, /). Print the result. Handle division by zero and invalid operators. Example: `./calc 10 + 3` prints `13`.",
            solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc != 4) {
        printf("Usage: %s <num1> <op> <num2>\\n", argv[0]);
        printf("  Operators: + - * /\\n");
        return 1;
    }
    
    double a = strtod(argv[1], NULL);
    char   op = argv[2][0];
    double b = strtod(argv[3], NULL);
    double result;
    
    switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
            if (b == 0.0) {
                printf("Error: division by zero\\n");
                return 1;
            }
            result = a / b;
            break;
        default:
            printf("Error: unknown operator '%c'\\n", op);
            return 1;
    }
    
    printf("%.6g %c %.6g = %.6g\\n", a, op, b, result);
    return 0;
}`
        },
        {
            title: "Cache-Friendly Matrix Sum",
            difficulty: "hard",
            problem: "Create a 512x512 int matrix filled with sequential values. Write two sum functions: one iterating row-major, one column-major. Use `clock()` to time both and print the results and timings. The row-major version should be noticeably faster.",
            solution: `#include <stdio.h>
#include <time.h>

#define N 512

int matrix[N][N];

long long rowMajorSum() {
    long long sum = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            sum += matrix[i][j];
    return sum;
}

long long colMajorSum() {
    long long sum = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            sum += matrix[i][j];
    return sum;
}

int main() {
    // Fill matrix
    int val = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            matrix[i][j] = val++;
    
    clock_t start, end;
    long long sum;
    
    start = clock();
    sum = rowMajorSum();
    end = clock();
    printf("Row-major:    sum=%lld, time=%ldms\\n",
           sum, (end - start) * 1000 / CLOCKS_PER_SEC);
    
    start = clock();
    sum = colMajorSum();
    end = clock();
    printf("Column-major: sum=%lld, time=%ldms\\n",
           sum, (end - start) * 1000 / CLOCKS_PER_SEC);
    
    return 0;
}`
        }
    ],

    exam: [
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int   a = 5, b = 2;
    float result = (float)a / b;
    printf("%.1f\\n", result);
    printf("%d\\n", a / b);
    return 0;
}`,
            options: ["2.5 then 2", "2.0 then 2", "2.5 then 3", "2.0 then 3"],
            answer: 0,
            explanation: "(float)a / b: a is cast to float before division, giving 2.5. a / b without cast is integer division: 2."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(int argc, char *argv[]) {
    printf("%d\\n", argc);
    printf("%s\\n", argv[0]);
    return 0;
}`,
            options: ["0 then (empty)", "1 then program name", "2 then program name", "Undefined"],
            answer: 1,
            explanation: "When run with no extra arguments, argc == 1 (the program name counts). argv[0] is always the program name or path."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int x = 5;
    int * const p = &x;
    *p = 99;
    printf("%d\\n", x);
    // p = NULL;  // would be compile error: p is const
    return 0;
}`,
            options: ["5", "99", "Compile error", "Undefined"],
            answer: 1,
            explanation: "int * const p: p itself cannot be reassigned, but *p can be modified. *p = 99 changes x to 99."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <string.h>
int main(void) {
    char s[] = "Hello World";
    char *tok = strtok(s, " ");
    while (tok) {
        printf("%s\\n", tok);
        tok = strtok(NULL, " ");
    }
    return 0;
}`,
            options: ["Hello World", "Hello then World", "H then e then l then l then o", "Hello\\nWorld"],
            answer: 1,
            explanation: "strtok splits on spaces. First call returns 'Hello', second returns 'World', third returns NULL ending the loop."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <string.h>
int main(void) {
    const char *path = "/usr/local/bin/gcc";
    const char *file = strrchr(path, '/');
    if (file) printf("%s\\n", file + 1);
    printf("%zu\\n", strlen(path));
    return 0;
}`,
            options: ["gcc then 18", "bin/gcc then 18", "gcc then 17", "/gcc then 18"],
            answer: 0,
            explanation: "strrchr finds the LAST '/'. file+1 skips it, giving 'gcc'. strlen counts all characters: /usr/local/bin/gcc = 18."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdlib.h>
int cmp(const void *a, const void *b) {
    return *(int*)a - *(int*)b;
}
int main(void) {
    int arr[] = {5, 2, 8, 1, 9, 3};
    qsort(arr, 6, sizeof(int), cmp);
    for (int i = 0; i < 6; i++) printf("%d ", arr[i]);
    return 0;
}`,
            options: ["5 2 8 1 9 3", "1 2 3 5 8 9", "9 8 5 3 2 1", "1 3 2 5 8 9"],
            answer: 1,
            explanation: "qsort sorts in-place using the comparator. cmp returns negative if a<b, so ascending order. Result: 1 2 3 5 8 9."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdbit.h>
int main(void) {
    unsigned int x = 0b10110100;
    printf("%u\\n", stdc_count_ones(x));
    printf("%u\\n", stdc_bit_floor(100u));
    printf("%u\\n", stdc_bit_ceil(100u));
    return 0;
}`,
            options: ["4 then 64 then 128", "4 then 64 then 100", "4 then 128 then 128", "8 then 64 then 128"],
            answer: 0,
            explanation: "0b10110100 has 4 set bits. bit_floor(100) = largest power of 2 ≤ 100 = 64. bit_ceil(100) = smallest power of 2 ≥ 100 = 128."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdckdint.h>
#include <limits.h>
int main(void) {
    int result;
    bool over1 = ckd_add(&result, 100, 200);
    printf("%d %d\\n", over1, result);
    bool over2 = ckd_add(&result, INT_MAX, 1);
    printf("%d\\n", over2);
    return 0;
}`,
            options: ["0 300 then 1", "1 300 then 0", "0 300 then 0", "1 300 then 1"],
            answer: 0,
            explanation: "100+200=300 fits in int: ckd_add returns false (0), result=300. INT_MAX+1 overflows: ckd_add returns true (1)."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    char *s = strdup("Hello");
    s[0] = 'J';
    printf("%s\\n", s);
    free(s);
    return 0;
}`,
            options: ["Hello", "Jello", "Compile error", "Undefined behavior"],
            answer: 1,
            explanation: "strdup allocates a heap copy of 'Hello'. Unlike string literals, heap copies are writable. s[0]='J' changes it to 'Jello'."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdatomic.h>
int main(void) {
    _Atomic int counter = 0;
    atomic_fetch_add(&counter, 5);
    atomic_fetch_add(&counter, 3);
    printf("%d\\n", atomic_load(&counter));
    int expected = 8;
    bool swapped = atomic_compare_exchange_strong(&counter, &expected, 100);
    printf("%d %d\\n", swapped, (int)counter);
    return 0;
}`,
            options: ["8 then 1 100", "8 then 0 8", "0 then 1 100", "8 then 1 8"],
            answer: 0,
            explanation: "After two fetch_adds, counter=8. CAS: expected==counter (both 8), so swap succeeds (returns true=1), counter becomes 100."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <math.h>
int main(void) {
    printf("%.4f\\n", fabs(-3.14));
    printf("%.4f\\n", floor(3.9));
    printf("%.4f\\n", ceil(3.1));
    printf("%.4f\\n", round(3.5));
    return 0;
}`,
            options: ["3.1400 then 3.0000 then 4.0000 then 4.0000",
                      "3.1400 then 4.0000 then 3.0000 then 4.0000",
                      "-3.1400 then 3.0000 then 4.0000 then 4.0000",
                      "3.1400 then 3.0000 then 4.0000 then 3.0000"],
            answer: 0,
            explanation: "fabs absolute value: 3.1400. floor rounds down: 3.0. ceil rounds up: 4.0. round rounds to nearest (0.5 rounds up): 4.0."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <string.h>
int main(void) {
    char dest[20] = {0};
    memcpy(dest, "Hello", 5);
    memmove(dest + 2, dest, 5);
    dest[7] = '\\0';
    printf("%s\\n", dest);
    return 0;
}`,
            options: ["Hello", "HeHello", "HoHell", "HeHelllo"],
            answer: 1,
            explanation: "After memcpy: dest = 'Hello'. memmove(dest+2, dest, 5) copies 5 bytes from start into offset 2 (overlapping, so memmove is safe): dest = 'HeHello'. Null at 7."
        }
    ]
};

window.ModuleExtra = ModuleExtra;