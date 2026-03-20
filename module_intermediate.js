const ModuleIntermediate = {
    description: "Bridging the gap: Advanced operator logic, multi-dimensional data structures, recursion, and understanding how variables live in memory. Plus C23 essentials: constexpr, nullptr, binary literals, _BitInt, and typed enumerations.",
    
    lessons: [
        {
            id: "advanced-operators",
            title: "Advanced Operators",
            explanation: "Beyond basic arithmetic, C gives you operators that work at the bit level, operators that compress decisions into single expressions, and operators that tell you things about the machine itself. These come up constantly in real C code, especially anything dealing with hardware, performance, or low-level data manipulation.",
            sections: [
                {
                    title: "The Ternary Operator",
                    content: "The ternary operator is a compressed <code>if-else</code> that fits inside an expression. Instead of a full block just to decide what value to assign, you write the whole thing in one line. It evaluates a condition, and produces one of two values depending on the result. The name 'ternary' just means it takes three operands — condition, true-value, false-value.",
                    points: [
                        "<strong>Syntax</strong>: <code>condition ? value_if_true : value_if_false</code> — read it as 'if condition, give me the left value, otherwise give me the right value'.",
                        "<strong>Why use it?</strong> For simple one-liner decisions, it's genuinely more readable than a five-line if-else block. Assigning a variable based on a condition is the sweet spot.",
                        "<strong>When to avoid it?</strong> The moment you start nesting ternary operators inside other ternary operators, stop. The result is technically valid C and completely unreadable to any human, including future you."
                    ],
                    code: `#include <stdio.h>

int main() {
    int age = 20;
    char *status = (age >= 18) ? "Adult" : "Minor";
    printf("Status: %s\\n", status);
    return 0;
}`,
                    output: "Status: Adult"
                },
                {
                    title: "Bitwise Operators (Introduction)",
                    content: "Every value in your program is ultimately stored as a sequence of bits — 0s and 1s in memory. Bitwise operators tear off the abstraction and let you manipulate individual bits directly. This is essential in embedded systems (toggling hardware pins), network programming (packing flags into bytes), graphics, encryption, and performance-sensitive code.",
                    points: [
                        "<code>&</code> (AND): The result bit is 1 only if BOTH corresponding bits are 1. Classic use: masking — isolating specific bits.",
                        "<code>|</code> (OR): Result is 1 if AT LEAST one bit is 1. Classic use: setting specific bits without touching others.",
                        "<code>^</code> (XOR): Result is 1 only if the bits are DIFFERENT. Classic use: toggling bits, simple encryption, the 'swap without temp' trick.",
                        "<code>~</code> (NOT): Flips every single bit. Be careful: <code>~5</code> on a 32-bit int gives -6 due to two's complement representation.",
                        "<code>&lt;&lt;</code> (Left Shift): Shifts bits left, filling right with zeros. Each shift left multiplies by 2.",
                        "<code>&gt;&gt;</code> (Right Shift): Shifts bits right. Each shift right divides by 2. Behavior on negative signed integers is implementation-defined — avoid on signed types."
                    ],
                    code: `#include <stdio.h>

int main() {
    int a = 5;  // Binary: 0000 0101
    int b = 3;  // Binary: 0000 0011
    
    // 0000 0101 & 0000 0011 -> 0000 0001 (1)
    printf("AND (&): %d\\n", a & b);
    
    // 0000 0101 | 0000 0011 -> 0000 0111 (7)
    printf("OR  (|): %d\\n", a | b);
    
    // 0000 0101 ^ 0000 0011 -> 0000 0110 (6)
    printf("XOR (^): %d\\n", a ^ b);
    
    // 0000 0101 -> 0000 1010 (10)
    printf("Left Shift (<<): %d\\n", a << 1);
    
    return 0;
}`,
                    output: "AND (&): 1\nOR  (|): 7\nXOR (^): 6\nLeft Shift (<<): 10"
                },
                {
                    title: "sizeof Operator",
                    content: "The <code>sizeof</code> operator tells you how many bytes a type or variable occupies in memory. It's evaluated entirely at compile time — it costs nothing at runtime. This is one of the most practically useful things in C because C makes no guarantees about the exact size of types across different platforms.",
                    points: [
                        "<strong>Why use it?</strong> On a typical 64-bit desktop, <code>int</code> is 4 bytes. On some embedded microcontrollers, it might be 2. If you hardcode sizes, your code silently breaks when compiled for a different target. <code>sizeof</code> makes your code adapt automatically.",
                        "<strong>Format Specifier</strong>: <code>sizeof</code> returns a value of type <code>size_t</code>, which is unsigned. Use <code>%zu</code> to print it correctly. Using <code>%d</code> technically causes undefined behavior on some platforms."
                    ],
                    code: `#include <stdio.h>

int main() {
    int i = 10;
    double d = 10.5;
    
    printf("Size of int: %zu bytes\\n", sizeof(i));
    printf("Size of double: %zu bytes\\n", sizeof(d));
    printf("Size of char: %zu bytes\\n", sizeof(char));
    
    int arr[] = {1, 2, 3, 4, 5};
    int numElements = sizeof(arr) / sizeof(arr[0]);
    printf("Array has %d elements.\\n", numElements);
    
    return 0;
}`,
                    output: "Size of int: 4 bytes\nSize of double: 8 bytes\nSize of char: 1 byte\nArray has 5 elements."
                },
                {
                    title: "Numeric Limits with limits.h",
                    content: "Every integer type has a minimum and maximum value determined by how many bits it uses. <code>&lt;limits.h&gt;</code> provides named constants for these limits — the most important being <code>INT_MAX</code>, <code>INT_MIN</code>, and their counterparts for other types. You've already seen <code>INT_MAX</code> in undefined behavior examples. Now here's where it actually comes from and why it matters.",
                    points: [
                        "<code>INT_MAX</code>: Maximum value of a signed <code>int</code> — 2,147,483,647 on 32-bit systems.",
                        "<code>INT_MIN</code>: Minimum value of a signed <code>int</code> — -2,147,483,648.",
                        "<code>UINT_MAX</code>: Maximum value of <code>unsigned int</code> — 4,294,967,295.",
                        "<code>LONG_MAX</code> / <code>LONG_MIN</code>: Limits for <code>long</code>.",
                        "<code>LLONG_MAX</code> / <code>LLONG_MIN</code>: Limits for <code>long long</code> — 9,223,372,036,854,775,807.",
                        "<code>CHAR_MAX</code> / <code>CHAR_MIN</code>: Limits for <code>char</code>. Whether <code>CHAR_MIN</code> is 0 or -128 reveals whether <code>char</code> is signed or unsigned on your platform."
                    ],
                    code: `#include <stdio.h>
#include <limits.h>

int main() {
    printf("INT_MAX:   %d\\n",  INT_MAX);   // 2147483647
    printf("INT_MIN:   %d\\n",  INT_MIN);   // -2147483648
    printf("UINT_MAX:  %u\\n",  UINT_MAX);  // 4294967295
    printf("LLONG_MAX: %lld\\n", LLONG_MAX); // 9223372036854775807
    printf("CHAR_MAX:  %d\\n",  CHAR_MAX);  // 127 (signed) or 255 (unsigned)
    
    // Practical use: check before adding to avoid overflow
    int x = INT_MAX;
    if (x < INT_MAX) {  // Safe to add 1
        x++;
    } else {
        printf("Cannot add: would overflow\\n");
    }
    
    return 0;
}`,
                    output: "INT_MAX:   2147483647\nINT_MIN:   -2147483648\nUINT_MAX:  4294967295\nLLONG_MAX: 9223372036854775807\nCHAR_MAX:  127\nCannot add: would overflow",
                    tip: "The <code>&lt;float.h&gt;</code> header provides the equivalent for floating-point types: <code>FLT_MAX</code>, <code>DBL_MAX</code>, <code>FLT_EPSILON</code> (the smallest float difference from 1.0), and <code>DBL_EPSILON</code>. <code>DBL_EPSILON</code> is especially useful for float comparisons: instead of <code>a == b</code> (unreliable), use <code>fabs(a - b) < DBL_EPSILON</code>."
                }
            ]
        },
        {
            id: "multi-arrays",
            title: "Multi-Dimensional Arrays",
            explanation: "A 2D array is an array of arrays. Where a regular array is a single row of data, a 2D array is a grid — rows and columns, like a spreadsheet, a game board, or a pixel image. They're declared and accessed with two index values, and under the hood they're stored as a flat block of memory that C navigates with arithmetic.",
            sections: [
                {
                    title: "Declaring 2D Arrays",
                    content: "The declaration <code>int matrix[3][4]</code> means 3 rows and 4 columns — 12 integers total. Both dimensions are zero-indexed, so rows go from 0 to 2 and columns from 0 to 3. You access any element by specifying its row first, then column: <code>matrix[row][col]</code>. Think of it like navigating a table — you pick the row first, then move across to the column.",
                    code: `#include <stdio.h>

int main() {
    // 3 Rows, 4 Columns
    int matrix[3][4] = {
        {1, 2, 3, 4},    // Row 0
        {5, 6, 7, 8},    // Row 1
        {9, 10, 11, 12}  // Row 2
    };
    
    printf("Element at [1][2]: %d\\n", matrix[1][2]); // 7
    
    return 0;
}`,
                    output: "Element at [1][2]: 7"
                },
                {
                    title: "Memory Layout",
                    content: "RAM is a single, linear sequence of bytes — no actual 2D structure. C stores 2D arrays in <strong>row-major order</strong>: Row 0 completely, then Row 1 immediately after, then Row 2, all in one contiguous block.",
                    tip: "This has real performance implications. Iterating row-by-row accesses memory sequentially — cache-friendly and fast. Iterating column-by-column jumps around in memory, causing cache misses and measurable slowdowns on large arrays. Always iterate in the order the data is laid out."
                },
                {
                    title: "Iterating Through 2D Arrays",
                    content: "The natural tool for 2D arrays is nested loops — outer loop over rows, inner loop over columns. The loop structure directly mirrors the conceptual grid.",
                    code: `#include <stdio.h>

int main() {
    int grid[2][3] = {
        {1, 2, 3},
        {4, 5, 6}
    };
    
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) {
            printf("%d ", grid[i][j]);
        }
        printf("\\n");
    }
    return 0;
}`,
                    output: "1 2 3 \n4 5 6 "
                }
            ]
        },
        {
            id: "recursion",
            title: "Recursion",
            explanation: "Recursion is when a function calls itself. This sounds circular to the point of being illegal, but it's perfectly valid and surprisingly powerful. The key insight is that the function calls itself with a simpler or smaller version of the problem each time, until it reaches a case so simple it doesn't need to recurse anymore.",
            sections: [
                {
                    title: "The Concept",
                    content: "Every recursive function needs exactly two things, and if either is missing or wrong, your program will either give wrong answers or crash. No exceptions.",
                    points: [
                        "<strong>Base Case</strong>: The condition under which the function stops calling itself and just returns a direct answer. This is the exit. Without it, the function calls itself forever until the program runs out of stack memory and crashes — a Stack Overflow. The base case is not optional.",
                        "<strong>Recursive Step</strong>: The function calling itself with a modified argument that moves it closer to the base case. Both conditions must be true: there must be a base case, AND each call must get closer to it.",
                        "<strong>Analogy</strong>: You're in a long line and want to know your position. You ask the person in front. They ask the person in front of them. This continues until someone is at the very front (the base case). They answer '1'. The answer propagates back down the line to you. That's recursion."
                    ]
                },
                {
                    title: "Example: Countdown",
                    code: `#include <stdio.h>

void countdown(int n) {
    if (n <= 0) {
        printf("Blastoff!\\n");
        return;
    }
    
    printf("%d...\\n", n);
    countdown(n - 1); // Recursive step
}

int main() {
    countdown(5);
    return 0;
}`,
                    output: "5...\n4...\n3...\n2...\n1...\nBlastoff!"
                },
                {
                    title: "The Call Stack",
                    content: "Every function call reserves a chunk of memory called a stack frame. In recursion, each call adds a new frame on top of the last one. For <code>countdown(5)</code>, you get 6 frames stacked up before any of them start returning. When the base case finally returns, the frames unwind one by one in reverse order.",
                    tip: "Recursion is elegant for certain problems, but it's not free. Each stack frame uses memory, and function calls have overhead. For very deep recursion (thousands of levels), you can legitimately run out of stack space. Use recursion when it makes the logic significantly clearer — tree traversal, divide-and-conquer algorithms, parsing nested structures. Don't use it just to seem clever."
                }
            ]
        },
        {
            id: "storage-classes",
            title: "Storage Classes",
            explanation: "Storage classes control two things about a variable: where it lives in memory, and how long it stays alive. Every variable in C has a storage class — usually determined automatically, but you can override it. Understanding this is what separates someone who knows C syntax from someone who understands how C programs actually execute.",
            sections: [
                {
                    title: "Automatic (auto)",
                    content: "This is the default for any variable declared inside a function or block. You almost never write the <code>auto</code> keyword explicitly — it's just what local variables are. They're created the moment execution enters the block they're declared in, and they're destroyed the moment execution leaves it. They live on the Stack — fast to allocate and deallocate. They're completely gone after the function returns — returning a pointer to a local variable is a classic and devastating mistake.",
                    code: `void func() {
    int x = 10; // auto int x = 10; is the same
    // x is created here
} // x is destroyed here`
                },
                {
                    title: "Static",
                    content: "<code>static</code> local variables are the exception to the 'destroyed when the function exits' rule. A <code>static</code> variable inside a function is initialized only once — the very first time the function runs — and then it persists for the entire lifetime of the program. Every subsequent call finds the variable exactly where it was left last time. This lets a function remember state between calls without using a global variable.",
                    code: `#include <stdio.h>

void counter() {
    static int count = 0;
    count++;
    printf("Count: %d\\n", count);
}

int main() {
    counter(); // prints 1
    counter(); // prints 2
    counter(); // prints 3
    return 0;
}`,
                    output: "Count: 1\nCount: 2\nCount: 3",
                    tip: "Without <code>static</code>, <code>count</code> would be re-created as 0 every time <code>counter()</code> is called, printing '1, 1, 1'. <code>static</code> on a global variable or function restricts visibility to the current file only — a useful encapsulation tool in multi-file projects."
                },
                {
                    title: "Extern",
                    content: "When a project spans multiple <code>.c</code> files, you sometimes need to access a global variable defined in a different file. <code>extern</code> says 'this variable exists and is defined somewhere else — don't allocate new memory for it, just let me use it'. It's a promise to the compiler that the linker will resolve later. Without <code>extern</code>, each file creates its own separate copy of the variable, which is almost never what you want."
                },
                {
                    title: "Register",
                    content: "A hint asking the compiler to store a variable in a CPU register rather than RAM. CPU registers are the fastest possible storage — built into the processor itself, single clock cycle access. In practice, modern compilers are far better at register allocation than any human, so they largely ignore the keyword. You'll rarely see it in new code, but you'll encounter it in older codebases."
                },
                {
                    title: "_Thread_local",
                    content: "<code>_Thread_local</code> (or <code>thread_local</code> in C11 with <code>&lt;threads.h&gt;</code>) is a storage class for multithreaded programs. A <code>_Thread_local</code> variable looks like a global — it has file scope and persists for the program's lifetime — but each thread gets its own independent copy. Writing to a thread-local variable from one thread has no effect on the same variable as seen from other threads.",
                    points: [
                        "<strong>Why it exists</strong>: Some global state is inherently per-thread. The classic example is <code>errno</code> — the error code set by system calls. If it were a true global, one thread's error would overwrite another thread's. <code>errno</code> is implemented as a thread-local variable in every modern C runtime.",
                        "<strong>Initialization</strong>: Thread-local variables are initialized once per thread, not once per program. Each new thread starts with the variable at its declared initial value.",
                        "<strong>Scope restriction</strong>: <code>_Thread_local</code> can only be applied to variables with static storage duration — globals and <code>static</code> locals. You can't apply it to regular local variables."
                    ],
                    code: `#include <stdio.h>
#include <threads.h>

// Each thread has its OWN copy of this variable
_Thread_local int thread_id = 0;

int thread_func(void *arg) {
    // Set our thread's copy - doesn't affect other threads
    thread_id = *(int*)arg;
    printf("Thread %d: my id = %d\\n", thread_id, thread_id);
    return 0;
}

int main() {
    thrd_t t1, t2;
    int id1 = 1, id2 = 2;
    
    thrd_create(&t1, thread_func, &id1);
    thrd_create(&t2, thread_func, &id2);
    
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);
    
    printf("Main: thread_id = %d\\n", thread_id); // Still 0 in main thread
    return 0;
}`,
                    output: "Thread 1: my id = 1\nThread 2: my id = 2\nMain: thread_id = 0"
                }
            ]
        },
        {
            id: "scope",
            title: "Scope, Lifetime, and assert()",
            explanation: "Scope is about visibility: from where in the code can a variable be seen? Lifetime is about time: how long does it exist in memory? These two concepts are related but distinct. We'll also cover <code>assert()</code> here — a debugging tool that checks invariants about your program's state and crashes loudly when they're violated.",
            sections: [
                {
                    title: "Local vs Global",
                    content: "A local variable is declared inside a function or block and is only visible within that function or block. A global variable is declared outside all functions, at the top level of the file, and is visible to every function in the file after the point of declaration. Global variables live for the entire duration of the program.",
                    code: `#include <stdio.h>

int globalVar = 100; // Global: visible everywhere after declaration

void myFunc() {
    printf("Global inside func: %d\\n", globalVar);
}

int main() {
    int localVar = 50; // Local: only visible inside main
    
    printf("Global: %d\\n", globalVar);
    printf("Local: %d\\n", localVar);
    
    myFunc();
    return 0;
}`
                },
                {
                    title: "Variable Shadowing",
                    content: "If you declare a local variable with the same name as a global variable, the local one takes over within its scope. The global still exists — it's just invisible from that inner scope, hidden behind the local variable. This is called shadowing, and it compiles perfectly while running silently wrong.",
                    code: `#include <stdio.h>

int x = 10; // Global

int main() {
    int x = 20; // Local 'x' shadows global 'x'
    
    printf("Local x: %d\\n", x); // Prints 20
    
    return 0;
}`,
                    warning: "Shadowing is legal C, but it's almost never intentional. When you read <code>x</code> and half the function is using the global while the other half is using the local, bugs become extremely hard to track down. Don't name local variables the same as globals."
                },
                {
                    title: "assert() — Catching Bugs Early",
                    content: "<code>assert()</code> from <code>&lt;assert.h&gt;</code> is a debugging macro that checks whether a condition is true. If the condition is true, nothing happens and execution continues normally. If the condition is false, the program immediately aborts and prints a message telling you exactly which assertion failed, in which file, and on which line. It's designed to catch programming errors — places where your assumptions about the program's state turned out to be wrong.",
                    points: [
                        "<strong>Syntax</strong>: <code>assert(condition)</code>. If <code>condition</code> evaluates to zero (false), the program aborts with an error message.",
                        "<strong>What it prints</strong>: Something like <code>Assertion failed: ptr != NULL, file main.c, line 15</code> — the exact condition, file, and line number. This is invaluable for debugging.",
                        "<strong>Disabling assertions</strong>: In production builds, you can disable all assertions at once by defining <code>NDEBUG</code> before including <code>&lt;assert.h&gt;</code>. Every <code>assert()</code> call then compiles to nothing — zero overhead. This is the intended workflow: use assertions liberally during development, disable them for release.",
                        "<strong>What to assert</strong>: Preconditions (things that must be true when a function is called), postconditions (things that must be true when it returns), and invariants (things that must always be true at specific points). Classic examples: pointer is not NULL before dereferencing, array index is within bounds, a value is in a valid range."
                    ],
                    code: `#include <stdio.h>
#include <assert.h>

// Divides a by b. b must NOT be zero.
double safeDivide(double a, double b) {
    assert(b != 0.0); // Crashes with helpful message if b is zero
    return a / b;
}

// Gets element at index. Index must be valid.
int getElement(int *arr, int size, int index) {
    assert(arr != NULL);          // Pointer must be valid
    assert(index >= 0);           // Index must be non-negative
    assert(index < size);         // Index must be within bounds
    return arr[index];
}

int main() {
    double result = safeDivide(10.0, 2.0);
    printf("10 / 2 = %.1f\\n", result); // 5.0
    
    int data[] = {10, 20, 30, 40, 50};
    printf("Element 2: %d\\n", getElement(data, 5, 2)); // 30
    
    // This would crash with a clear assertion failure message:
    // safeDivide(10.0, 0.0);
    // getElement(data, 5, 10); // Index 10 out of bounds
    
    return 0;
}`,
                    output: "10 / 2 = 5.0\nElement 2: 30",
                    tip: "Use <code>assert()</code> freely during development. If a function receives a NULL pointer it was never supposed to receive, that's a programming bug — not a runtime error the function should handle gracefully. Assert it. The crash and the message will immediately point you to the problem. This is far better than silently proceeding with bad data and crashing somewhere unrelated 200 lines later."
                }
            ]
        },
        {
            id: "c23-core",
            title: "C23: constexpr, nullptr, Binary Literals, _BitInt",
            explanation: "C23 is the most significant update to C in over a decade. It introduces proper compile-time constants with <code>constexpr</code>, a typed null pointer constant <code>nullptr</code>, binary integer literals, digit separators for readability, and bit-precise integer types with <code>_BitInt</code>. These aren't cosmetic changes — they fix longstanding design weaknesses in the language.",
            sections: [
                {
                    title: "constexpr: True Compile-Time Constants",
                    content: "Before C23, the only way to create a named integer constant usable in array sizes, <code>case</code> labels, and <code>_Static_assert</code> was via <code>#define</code> (no type) or <code>enum</code> (integers only, awkward for other types). C23 adds <code>constexpr</code>, giving you a typed, scoped, debuggable compile-time constant. It can be used everywhere an integer constant expression is required.",
                    code: `#include <stdio.h>

// C23: typed, scoped constants — unlike #define, these have a type
// and show up properly in debuggers
constexpr int    BUFFER_SIZE = 1024;
constexpr double PI          = 3.14159265358979;
constexpr int    MAX_USERS   = 100;

// Can be used in array sizes (compile-time constant):
char buffer[BUFFER_SIZE];

// Can be used in case labels:
int classify_buffer(int size) {
    switch (size) {
        case BUFFER_SIZE: return 1;   // Valid — constexpr is an ICE
        default:          return 0;
    }
}

// Can be used in _Static_assert:
_Static_assert(BUFFER_SIZE > 0, "Buffer must be positive");
_Static_assert(MAX_USERS  <= 1000, "Too many users");

int main(void) {
    printf("Buffer size: %d\\n", BUFFER_SIZE);
    printf("Pi:          %.5f\\n", PI);
    printf("Max users:   %d\\n", MAX_USERS);

    // constexpr in a function — block scope
    constexpr int LOCAL_MAX = 50;
    int arr[LOCAL_MAX];
    printf("Local array size: %d\\n", LOCAL_MAX);
    (void)arr;
    return 0;
}`,
                    output: `Buffer size: 1024
Pi:          3.14159
Max users:   100
Local array size: 50`,
                    tip: "Prefer <code>constexpr</code> over <code>#define</code> for constants in new C23 code. A <code>#define</code> is a text substitution with no type, no scope, and no visibility in the debugger. <code>constexpr</code> is a real typed variable that happens to be evaluated at compile time."
                },
                {
                    title: "nullptr and nullptr_t (C23)",
                    content: "Before C23, C had no typed null pointer constant. <code>NULL</code> was typically defined as <code>((void*)0)</code> or just <code>0</code>, which is an integer — causing subtle problems in overloaded contexts and <code>_Generic</code> expressions. C23 introduces <code>nullptr</code>, a keyword with its own type <code>nullptr_t</code>, which converts to any pointer type but is distinct from integer zero.",
                    code: `#include <stdio.h>
#include <stddef.h>   // nullptr_t

// nullptr converts to any pointer type
int* find_value(int *arr, int size, int target) {
    for (int i = 0; i < size; i++) {
        if (arr[i] == target) return &arr[i];
    }
    return nullptr;   // C23: typed, unambiguous null pointer
}

// nullptr_t is a distinct type — useful in _Generic
#define describe_ptr(P) _Generic((P),        \\
    nullptr_t: "null pointer constant",       \\
    int*:      "int pointer",                 \\
    char*:     "char pointer",                \\
    default:   "other pointer"               \\
)

int main(void) {
    int data[] = {10, 20, 30, 40, 50};

    int *found = find_value(data, 5, 30);
    if (found != nullptr) {
        printf("Found: %d\\n", *found);
    }

    int *missing = find_value(data, 5, 99);
    if (missing == nullptr) {
        printf("Not found\\n");
    }

    // _Generic can now distinguish nullptr from int*
    printf("nullptr is: %s\\n", describe_ptr(nullptr));
    printf("int* is:    %s\\n", describe_ptr((int*)nullptr));
    return 0;
}`,
                    output: `Found: 30
Not found
nullptr is: null pointer constant
int* is:    int pointer`
                },
                {
                    title: "Binary Literals and Digit Separators (C23)",
                    content: "C23 adds two readability features for numeric literals. Binary literals use the <code>0b</code> or <code>0B</code> prefix (like most modern languages). Digit separators allow single quotes (<code>'</code>) between digits in any numeric literal — ignored by the compiler, purely for human readability.",
                    code: `#include <stdio.h>

int main(void) {
    // Binary literals (C23) — much clearer than hex for bit patterns
    unsigned char flags      = 0b10110100;
    unsigned int  permission = 0b111101101;  // rwxr-xr--
    unsigned int  mask       = 0b11110000;

    printf("flags:      0x%02X (%d)\\n", flags, flags);
    printf("permission: 0%o (octal)\\n", permission);
    printf("mask:       0b%08b (%d)\\n", mask, mask);

    // Digit separators (C23) — ' is ignored, just for readability
    long long  population  = 8'100'000'000LL;   // 8.1 billion
    double     speed_c     = 299'792'458.0;      // speed of light m/s
    unsigned   hex_color   = 0xFF'A5'00;         // orange in RGB
    unsigned   binary_byte = 0b1010'0101;        // nibble groups

    printf("Population:  %lld\\n", population);
    printf("Speed of c:  %.0f m/s\\n", speed_c);
    printf("Orange:      #%06X\\n", hex_color);
    printf("Binary byte: %u\\n", binary_byte);
    return 0;
}`,
                    output: `flags:      0xB4 (180)
permission: 0765 (octal)
mask:       0b11110000 (240)
Population:  8100000000
Speed of c:  299792458 m/s
Orange:      #FFA500
Binary byte: 165`,
                    tip: "Use digit separators whenever a large number would otherwise require counting digits. <code>8'100'000'000</code> is instantly readable as eight billion; <code>8100000000</code> requires counting. In binary literals, grouping by nibbles (<code>0b1010'0101</code>) makes bit patterns dramatically clearer."
                },
                {
                    title: "_BitInt: Bit-Precise Integer Types (C23)",
                    content: "Standard integer types (int, long, etc.) come in fixed sizes dictated by the platform. C23 introduces <code>_BitInt(N)</code> for integers of exactly N bits. This is essential for cryptography, hardware simulation, network protocol fields, and any domain where you need a specific bit width that doesn't happen to be 8, 16, 32, or 64.",
                    code: `#include <stdio.h>
#include <stdint.h>

int main(void) {
    // Exact bit widths — not available with standard types
    unsigned _BitInt(3) u3 = 7;   // 3 bits: values 0-7
    signed   _BitInt(3) s3 = -4;  // 3 bits: values -4 to 3
             _BitInt(3) s3b = 3;  // signed by default

    printf("u3 = %u (3-bit unsigned max = 7)\\n", (unsigned)u3);
    printf("s3 = %d (3-bit signed min = -4)\\n", (int)s3);

    // Useful for packing protocol fields
    unsigned _BitInt(4) nibble = 0b1010;
    unsigned _BitInt(6) six_bit = 63;  // max for 6-bit unsigned
    unsigned _BitInt(7) seven_bit = 100;

    printf("nibble (4-bit): %u\\n",  (unsigned)nibble);
    printf("6-bit max:      %u\\n",  (unsigned)six_bit);
    printf("7-bit value:    %u\\n",  (unsigned)seven_bit);

    // Overflow wraps within the bit width
    unsigned _BitInt(4) overflow = 15 + 1;  // Wraps to 0
    printf("4-bit 15+1:     %u\\n",  (unsigned)overflow);

    // wb suffix for _BitInt literals (C23)
    unsigned _BitInt(8) byte_val = 255wb;
    printf("255wb:          %u\\n",  (unsigned)byte_val);
    return 0;
}`,
                    output: `u3 = 7 (3-bit unsigned max = 7)
s3 = -4 (3-bit signed min = -4)
nibble (4-bit): 10
6-bit max:      63
7-bit value:    100
4-bit 15+1:     0
255wb:          255`,
                    warning: "<code>_BitInt</code> types do not use standard format specifiers in <code>printf</code> — you must cast to a standard integer type first (<code>(unsigned)my_bitint</code>). Also, arithmetic on <code>_BitInt</code> types wraps at the specified bit width, not at the standard integer width."
                },
                {
                    title: "Enhanced Enumerations (C23)",
                    content: "C23 allows enumeration types to have an explicit underlying type, and allows enumeration constants outside the range of <code>signed int</code>. Before C23, all enum constants had to fit in a <code>signed int</code>, which was a crippling limitation for bit masks and large constant sets.",
                    code: `#include <stdio.h>
#include <stdint.h>

// C23: explicit underlying type for enum
// Underlying type is uint32_t — can hold values up to 4 billion
enum Permission : uint32_t {
    PERM_NONE    = 0,
    PERM_READ    = 0x00000001,
    PERM_WRITE   = 0x00000002,
    PERM_EXEC    = 0x00000004,
    PERM_DELETE  = 0x00000008,
    PERM_ADMIN   = 0x80000000,   // Would fail pre-C23! Exceeds signed int
    PERM_ALL     = 0xFFFFFFFF    // Same — now valid
};

// C23: enum constants larger than INT_MAX
enum BigFlags : unsigned long long {
    FLAG_LOW  = 1ULL,
    FLAG_HIGH = 0x8000000000000000ULL   // 2^63 — impossible pre-C23
};

int main(void) {
    enum Permission user_perms = PERM_READ | PERM_WRITE;

    if (user_perms & PERM_READ)  printf("Can read\\n");
    if (user_perms & PERM_WRITE) printf("Can write\\n");
    if (!(user_perms & PERM_EXEC)) printf("Cannot execute\\n");

    printf("PERM_ADMIN  = 0x%08X\\n", (uint32_t)PERM_ADMIN);
    printf("PERM_ALL    = 0x%08X\\n", (uint32_t)PERM_ALL);
    printf("FLAG_HIGH   = 0x%llX\\n", (unsigned long long)FLAG_HIGH);
    return 0;
}`,
                    output: `Can read
Can write
Cannot execute
PERM_ADMIN  = 0x80000000
PERM_ALL    = 0xFFFFFFFF
FLAG_HIGH   = 0x8000000000000000`
                }
            ]
        }
    ],
    
    quiz: [
        {
            question: "What does the ternary operator return?",
            options: ["Boolean only", "One of two values", "Nothing", "A pointer"],
            answer: 1
        },
        {
            question: "What is 5 << 1 in bitwise operations?",
            options: ["5", "10", "2", "1"],
            answer: 1
        },
        {
            question: "In a 2D array `arr[3][4]`, how many columns does it have?",
            options: ["3", "4", "7", "12"],
            answer: 1
        },
        {
            question: "What happens if a recursive function has no base case?",
            options: ["Returns 0", "Stack Overflow", "Syntax Error", "Infinite Loop"],
            answer: 1
        },
        {
            question: "What keyword preserves a variable's value between function calls?",
            options: ["auto", "extern", "static", "const"],
            answer: 2
        },
        {
            question: "Global variables are stored in which memory segment?",
            options: ["Stack", "Heap", "Data/BSS", "Register"],
            answer: 2
        },
        {
            question: "What does 'variable shadowing' mean?",
            options: ["Variable is deleted", "Local variable hides global variable", "Variable is constant", "Variable is optimized"],
            answer: 1
        },
        {
            question: "Which operator returns the size in bytes?",
            options: ["size()", "sizeof", "length", "bytes"],
            answer: 1
        },
        {
            question: "What header provides INT_MAX and CHAR_MIN?",
            options: ["<stdint.h>", "<stdlib.h>", "<limits.h>", "<values.h>"],
            answer: 2
        },
        {
            question: "What happens when an assert() condition is false?",
            options: ["Returns 0", "Prints a warning and continues", "Program aborts with error message", "Compiler error"],
            answer: 2
        },
        {
            question: "What does _Thread_local do?",
            options: ["Makes a variable const", "Gives each thread its own copy of the variable", "Locks the variable for thread safety", "Moves the variable to the heap"],
            answer: 1
        }
    ],
    
    practice: [
        {
            title: "Matrix Diagonal Sum",
            difficulty: "medium",
            problem: "Write a program to find the sum of the main diagonal elements of a 3x3 matrix. (Indices where row index == column index).",
            solution: `#include <stdio.h>

int main() {
    int matrix[3][3] = {{1,2,3},{4,5,6},{7,8,9}};
    int sum = 0;
    
    for(int i=0; i<3; i++) {
        sum += matrix[i][i];
    }
    printf("Diagonal Sum: %d\\n", sum);
    return 0;
}`
        },
        {
            title: "Recursive Factorial",
            difficulty: "medium",
            problem: "Rewrite the factorial function using recursion instead of a loop. factorial(n) = n * factorial(n-1).",
            solution: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n-1);
}

int main() {
    printf("5! = %d\\n", factorial(5));
    return 0;
}`
        },
        {
            title: "Call Counter",
            difficulty: "easy",
            problem: "Create a function that tracks how many times it has been called using a static variable.",
            solution: `#include <stdio.h>

void tracker() {
    static int calls = 0;
    calls++;
    printf("Called %d times.\\n", calls);
}

int main() {
    tracker();
    tracker();
    tracker();
    return 0;
}`
        },
        {
            title: "Safe Array Access",
            difficulty: "medium",
            problem: "Write a function getElement(int *arr, int size, int index) that uses assert() to validate the pointer is not NULL and the index is within bounds, then returns the element.",
            solution: `#include <stdio.h>
#include <assert.h>

int getElement(int *arr, int size, int index) {
    assert(arr != NULL);
    assert(index >= 0);
    assert(index < size);
    return arr[index];
}

int main() {
    int data[] = {10, 20, 30, 40, 50};
    printf("Element 0: %d\\n", getElement(data, 5, 0));
    printf("Element 4: %d\\n", getElement(data, 5, 4));
    // getElement(data, 5, 10); // Would abort with assertion failure
    return 0;
}`
        }
    ],
    
    exam: [
        {
            question: "What is the result of 12 & 10?",
            options: ["14", "8", "6", "1100"],
            answer: 1
        },
        {
            question: "2D arrays are stored in memory as:",
            options: ["Scattered blocks", "A single contiguous block", "Linked lists", "Pointers"],
            answer: 1
        },
        {
            question: "Recursion typically uses more:",
            options: ["Disk Space", "Stack Memory", "Heap Memory", "CPU Registers"],
            answer: 1
        },
        {
            question: "static int x inside a function is initialized:",
            options: ["Every call", "Only once", "Never", "On demand"],
            answer: 1
        },
        {
            question: "extern keyword is used for:",
            options: ["Defining a variable", "Declaring an external variable", "Hiding a variable", "Deleting a variable"],
            answer: 1
        },
        {
            question: "Scope determines:",
            options: ["Variable lifetime", "Variable visibility", "Variable size", "Variable type"],
            answer: 1
        },
        {
            question: "Bitwise XOR of a number with itself is always:",
            options: ["1", "0", "The number", "-1"],
            answer: 1
        },
        {
            question: "What is the output of: printf(\"%zu\", sizeof(double));?",
            options: ["4", "8", "16", "Compiler dependent"],
            answer: 3
        },
        {
            question: "What macro in <limits.h> holds the maximum value of an int?",
            options: ["MAX_INT", "INT_MAX", "INTEGER_MAX", "MAXINT"],
            answer: 1
        },
        {
            question: "assert() is disabled at compile time by defining:",
            options: ["NO_ASSERT", "ASSERT_OFF", "NDEBUG", "DISABLE_ASSERT"],
            answer: 2
        },
        {
            question: "In C23, 'constexpr int N = 10;' differs from '#define N 10' because:",
            options: [
                "constexpr is only valid inside functions",
                "constexpr has a type, scope, and shows in the debugger",
                "constexpr values cannot be used in switch case labels",
                "There is no practical difference"
            ],
            answer: 1
        },
        {
            question: "What is the type of 'nullptr' in C23?",
            options: ["void*", "int", "nullptr_t", "null_t"],
            answer: 2
        },
        {
            question: "Which C23 literal represents 255 in binary?",
            options: ["0255", "255b", "0b11111111", "b11111111"],
            answer: 2
        },
        {
            question: "What does unsigned _BitInt(4) allow as its maximum value?",
            options: ["4", "8", "15", "16"],
            answer: 2
        },
        {
            question: "In C23, 'enum Color : uint8_t { RED, GREEN, BLUE };' means:",
            options: [
                "The enum values are stored as pointers",
                "The enum's underlying storage type is uint8_t",
                "Only values 0-2 are allowed",
                "The enum cannot be used in switch statements"
            ],
            answer: 1
        }
    ]
};

window.ModuleIntermediate = ModuleIntermediate;