const ModuleLowLevel = {
    description: "The heart of C: Pointers, dynamic memory, function pointers, C11/C23 memory alignment — plus two essential professional skills: using compiler warnings and sanitizers as your first line of defence, and a deep treatment of undefined behavior and why it's the most dangerous concept in C.",
    
    lessons: [
        {
            id: "pointers-intro",
            title: "Introduction to Pointers",
            explanation: "A pointer is a variable that stores the memory address of another variable. Not the value — the address. Where it lives. Every variable you declare occupies some bytes in RAM, and those bytes are at a specific, numbered location. A pointer holds that number. The classic analogy: think of RAM as a city full of houses. A regular variable is the house itself. A pointer is a piece of paper with the house's address written on it. The paper is not the house, but with it you can find the house, look inside, and change what's there.",
            sections: [
                {
                    title: "The Two Key Operators",
                    content: "Two operators govern everything about pointers. You will use them thousands of times. They look identical to other operators you already know, but in the context of pointers they mean something completely different.",
                    points: [
                        "<strong>& (Address-of Operator)</strong>: Applied to a variable, it gives you that variable's memory address. <code>&num</code> doesn't give you the value of <code>num</code> — it gives you the location in memory where <code>num</code> lives. Think of it as asking 'where is this house?'",
                        "<strong>* (Dereference Operator)</strong>: Applied to a pointer, it follows the address and gives you the value stored at that location. <code>*ptr</code> means 'go to the address stored in ptr and give me what's there'. Think of it as actually going to the house and looking inside. The same <code>*</code> symbol is also used in pointer declarations — context tells you which meaning applies."
                    ]
                },
                {
                    title: "Creating a Pointer",
                    content: "Declaring a pointer looks like a normal variable declaration but with a <code>*</code> between the type and the name. The type matters — an <code>int*</code> is a pointer to an int, a <code>char*</code> is a pointer to a char. The type tells C how to interpret the bytes at the address, and how far to move when doing pointer arithmetic. Always initialize a pointer when you declare it. An uninitialized pointer contains a random address — dereferencing it reads or writes some unpredictable location in memory, which is one of the nastiest bugs in existence.",
                    code: `#include <stdio.h>

int main() {
    int num = 42;       // A regular integer variable
    
    // Declaration: int* means "pointer to an int"
    // Initialization: &num gets the address of num
    int *ptr = &num; 
    
    printf("Value of num: %d\\n", num);
    
    // %p is the format specifier for addresses
    printf("Address of num: %p\\n", (void*)&num);
    printf("Value inside ptr: %p\\n", (void*)ptr);
    
    // *ptr means "go to the address stored in ptr"
    printf("Value pointed to by ptr: %d\\n", *ptr);
    
    return 0;
}`,
                    output: "Value of num: 42\nAddress of num: 0x7ffd...\nValue inside ptr: 0x7ffd...\nValue pointed to by ptr: 42"
                },
                {
                    title: "Modifying via Pointer",
                    content: "Because a pointer knows where a variable lives, it can reach in and change it directly. <code>*ptr = 20</code> doesn't change <code>ptr</code> itself — it goes to the address <code>ptr</code> holds and changes the value at that location. Since <code>ptr</code> points to <code>x</code>, <code>x</code> gets changed. This is the mechanism behind passing variables to functions that can actually modify them — something plain pass-by-value can never do.",
                    code: `#include <stdio.h>

int main() {
    int x = 10;
    int *ptr = &x;
    
    printf("Original x: %d\\n", x);
    
    *ptr = 20; // Go to address stored in ptr, set value to 20
    
    printf("Modified x: %d\\n", x);
    
    return 0;
}`,
                    output: "Original x: 10\nModified x: 20"
                },
                {
                    title: "The NULL Pointer",
                    content: "NULL is a special constant (usually 0) that explicitly means 'this pointer points to nothing'. If you have a pointer but don't have an address to assign it yet, initialize it to NULL rather than leaving it uninitialized. An uninitialized pointer holds a garbage address — dereferencing it corrupts some random piece of memory silently. A NULL pointer, if accidentally dereferenced, crashes immediately with a Segmentation Fault, which is actually preferable — a crash with a clear cause is infinitely easier to debug than a silent corruption that shows up as a wrong answer three functions later.",
                    warning: "Dereferencing a NULL pointer crashes your program immediately with a Segmentation Fault. This is actually the intended behavior of NULL — it acts as a landmine that detonates loudly the moment you misuse it. Always check <code>if (ptr != NULL)</code> before dereferencing any pointer that might be NULL, especially pointers returned from functions like <code>malloc</code>."
                },
                {
                    title: "Dangling Pointers",
                    content: "A dangling pointer is a pointer that once pointed to valid memory, but that memory is no longer valid. The pointer still holds the old address — it just doesn't own it anymore. The two most common ways to create one: freeing heap memory and keeping the pointer around, or returning a pointer to a local variable from a function (the local variable is destroyed when the function returns).",
                    points: [
                        "<strong>After free()</strong>: Calling <code>free(ptr)</code> releases the heap block. The memory may be immediately handed to someone else. But <code>ptr</code> still holds the old address. Reading from it gives garbage; writing to it corrupts whatever is now living there.",
                        "<strong>After a function returns</strong>: If a function returns a pointer to one of its own local variables, that variable is gone the moment the function exits. The pointer points into a stack frame that no longer exists.",
                        "<strong>The fix</strong>: After calling <code>free(ptr)</code>, immediately set <code>ptr = NULL</code>. This converts a dangling pointer into a NULL pointer. Accidentally dereferencing NULL crashes loudly. Accidentally dereferencing a dangling address corrupts memory silently. Loud is always better."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Safe pattern: NULL the pointer after freeing
    int *safe = (int*)malloc(sizeof(int));
    *safe = 200;
    free(safe);
    safe = NULL; // Now it's NULL, not dangling
    
    if (safe != NULL) {
        printf("%d\\n", *safe);
    } else {
        printf("Pointer is NULL, not dereferencing.\\n");
    }
    
    return 0;
}`,
                    output: "Pointer is NULL, not dereferencing.",
                    warning: "Dangling pointers are among the most dangerous bugs in C because they are invisible. The code compiles cleanly, may run correctly for a while, and then fails in a completely unrelated part of the program when the corrupted memory is eventually read. Always NULL your pointers after freeing them."
                }
            ]
        },
        {
            id: "pointer-arithmetic",
            title: "Pointer Arithmetic",
            explanation: "You can do arithmetic on pointers — add, subtract, increment, decrement. But pointer arithmetic is not regular integer arithmetic. When you add 1 to a pointer, you don't add 1 byte. You add the size of whatever the pointer points to. This is the language automatically scaling movement to the size of the data type, so that pointer arithmetic always moves in meaningful, aligned steps.",
            sections: [
                {
                    title: "How it Works",
                    content: "If <code>ptr</code> is an <code>int*</code> and ints are 4 bytes, then <code>ptr + 1</code> adds 4 to the actual memory address. <code>ptr + 2</code> adds 8. This is not a coincidence — it's the only way pointer arithmetic makes sense. C does the scaling automatically based on the declared pointer type, which is exactly why the type of a pointer matters beyond just how to interpret the value.",
                    code: `#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30};
    int *ptr = arr; // arr decays to pointer to first element
    
    printf("Current address: %p, Value: %d\\n", (void*)ptr, *ptr);
    
    ptr++; // Move to next int (adds 4 bytes usually)
    printf("Next address: %p, Value: %d\\n", (void*)ptr, *ptr);
    
    ptr++; // Move again
    printf("Next address: %p, Value: %d\\n", (void*)ptr, *ptr);
    
    return 0;
}`,
                    output: "Current address: 0x..., Value: 10\nNext address: 0x..., Value: 20\nNext address: 0x..., Value: 30"
                },
                {
                    title: "Pointers and Arrays are Related",
                    content: "When you use an array name in an expression, C automatically converts it to a pointer to the first element. This is called array decay. The consequence is that <code>arr[i]</code> and <code>*(arr + i)</code> are literally the same operation. The compiler translates bracket notation into pointer arithmetic. Bracket notation is just syntactic sugar.",
                    points: [
                        "<code>arr[i]</code> means: start at the address of <code>arr</code>, move <code>i</code> elements forward (scaling by element size), then dereference.",
                        "<code>*(arr + i)</code> means: exactly the same thing. Both expressions produce identical machine code."
                    ],
                    code: `#include <stdio.h>

int main() {
    int data[] = {100, 200, 300};
    
    // These two lines are EXACTLY the same to the compiler
    printf("Array notation: %d\\n", data[1]);
    printf("Pointer notation: %d\\n", *(data + 1));
    
    return 0;
}`,
                    output: "Array notation: 200\nPointer notation: 200"
                },
                {
                    title: "Pointer Subtraction and ptrdiff_t",
                    content: "Just as you can add an integer to a pointer, you can subtract two pointers from each other — as long as they both point into the same array. The result is the number of elements between them, not the number of bytes. The type of this result is <code>ptrdiff_t</code>, defined in <code>&lt;stddef.h&gt;</code>. It's a signed integer type — it can be negative if the first pointer is to the right of the second.",
                    points: [
                        "<strong>What it gives you</strong>: <code>end - start</code> tells you how many elements of the array's type are between those two positions. If both pointers point to an <code>int</code> array and are 4 elements apart, the result is 4 — not 16 (the byte count).",
                        "<strong>Use case: finding position</strong>: If you search through an array and find a match, you can subtract the base pointer from the match pointer to get the index. <code>found - arr</code> gives you the index of the found element.",
                        "<strong>Format specifier</strong>: Print <code>ptrdiff_t</code> with <code>%td</code>. Using <code>%d</code> is technically undefined behavior on platforms where <code>ptrdiff_t</code> is larger than <code>int</code>.",
                        "<strong>Only within the same array</strong>: Subtracting pointers that point into different arrays is undefined behavior. The result is meaningless — the two addresses have no meaningful relationship."
                    ],
                    code: `#include <stdio.h>
#include <stddef.h> // for ptrdiff_t

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *start = arr;
    int *end   = arr + 5; // Points one past the last element
    
    // Number of elements between start and end
    ptrdiff_t count = end - start;
    printf("Elements: %td\\n", count); // 5
    
    // Find the index of a value using pointer subtraction
    int target = 30;
    int *found = NULL;
    for (int *p = arr; p < end; p++) {
        if (*p == target) {
            found = p;
            break;
        }
    }
    
    if (found) {
        ptrdiff_t index = found - arr;
        printf("Found %d at index %td\\n", target, index); // index 2
    }
    
    return 0;
}`,
                    output: "Elements: 5\nFound 30 at index 2"
                }
            ]
        },
        {
            id: "pointers-functions",
            title: "Pointers and Functions",
            explanation: "Remember from the Functions module that C passes arguments by value — functions get copies, and whatever they do to their copies has no effect on the caller's originals. Pointers are the solution to this. Instead of passing the variable, you pass its address. The function receives a pointer and can dereference it to read or modify the original variable directly. This is how C achieves pass-by-reference — by explicitly passing addresses.",
            sections: [
                {
                    title: "Swapping Two Numbers",
                    content: "The swap function is the canonical example of why you need pointers. Without pointers, a swap function would receive copies of both values, swap the copies, and return — the originals unchanged. With pointers, the function receives the addresses of the originals and operates directly on them. Walk through this carefully: <code>*a</code> is not <code>a</code> — it's the value at the address <code>a</code> holds. When you write <code>*a = *b</code>, you're saying 'store the value at address b into the location at address a'. The actual variables in main are being modified in real time.",
                    code: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a; // Store value at address a
    *a = *b;       // Put value at address b into address a
    *b = temp;     // Put temp value into address b
}

int main() {
    int x = 5, y = 10;
    
    printf("Before: x=%d, y=%d\\n", x, y);
    swap(&x, &y);
    printf("After:  x=%d, y=%d\\n", x, y);
    
    return 0;
}`,
                    output: "Before: x=5, y=10\nAfter:  x=10, y=5"
                }
            ]
        },
        {
            id: "dynamic-memory",
            title: "Dynamic Memory Allocation",
            explanation: "Every array and variable we've created so far had a fixed size decided at compile time — before the program runs. But real programs often don't know how much memory they'll need until runtime: a user might enter 5 items or 5000. Dynamic memory allocation lets you request memory from the operating system while the program is actually running. That memory comes from a region called the Heap, which is large and flexible — but unlike the Stack, it requires you to manage it yourself.",
            sections: [
                {
                    title: "The Heap vs The Stack",
                    content: "The Stack is where local variables and function call frames live. It's fast, automatically managed — memory is claimed and released as functions enter and exit — but it's limited in size (typically a few megabytes). The Heap is a large pool of memory managed by the OS and the C runtime. You request chunks from it manually, use them as long as you need, and then explicitly release them when done. The Heap can hold far more data than the Stack, but it comes with full responsibility: if you forget to release heap memory, it stays reserved for the lifetime of the process.",
                    warning: "Heap memory does not clean itself up. Every byte you allocate with <code>malloc</code>, <code>calloc</code>, or <code>realloc</code> must eventually be released with <code>free</code>. Forgetting this is called a <strong>Memory Leak</strong>. In a small program that runs and exits, leaked memory gets reclaimed when the process ends. In a long-running program — a server, a background service, an embedded system — memory leaks accumulate until the system runs out of memory entirely. This has taken down production systems."
                },
                {
                    title: "void* — The Generic Pointer",
                    content: "Before looking at <code>malloc</code>, you need to understand what it returns: a <code>void*</code>. A void pointer is a pointer with no type. It holds a memory address, but it carries no information about what kind of data lives at that address. This makes it a generic pointer — it can be assigned to any pointer type without a cast in C.",
                    points: [
                        "<strong>What it is</strong>: <code>void*</code> just means 'pointer to some memory, type unknown'. It's the only pointer type that can be freely converted to and from any other pointer type.",
                        "<strong>What you can't do with it</strong>: You cannot dereference a <code>void*</code> directly, and you cannot do pointer arithmetic on it. You must first cast it to a typed pointer.",
                        "<strong>Why malloc returns it</strong>: <code>malloc</code> doesn't care whether you're allocating space for ints, chars, structs, or anything else. It just gives you a raw block of bytes. Returning <code>void*</code> lets you assign the result directly to whatever typed pointer you have.",
                        "<strong>The cast <code>(int*)</code></strong>: In C, casting the return of <code>malloc</code> is technically unnecessary — the implicit conversion from <code>void*</code> to any pointer type is valid. But writing it explicitly makes the intent clear."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    void *raw = malloc(sizeof(int));
    
    // You must cast before dereferencing
    int *typed = (int*)raw;
    *typed = 42;
    printf("Value: %d\\n", *typed);
    
    free(raw);
    return 0;
}`,
                    output: "Value: 42"
                },
                {
                    title: "malloc (Memory Allocation)",
                    content: "<code>malloc</code> requests a raw block of memory of the specified size in bytes and returns a pointer to the start of it. The memory is not initialized — whatever bytes were there before are still there, so you're reading garbage until you write something. Always check the return value: if the OS can't fulfill the request (out of memory), <code>malloc</code> returns NULL.",
                    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr;
    int n = 5;
    
    ptr = (int*)malloc(n * sizeof(int));
    
    if (ptr == NULL) {
        printf("Memory allocation failed.\\n");
        return 1;
    }
    
    // Use it exactly like an array
    for (int i = 0; i < n; i++) {
        ptr[i] = i + 1;
    }
    
    for (int i = 0; i < n; i++) {
        printf("%d ", ptr[i]);
    }
    
    free(ptr);
    
    return 0;
}`,
                    output: "1 2 3 4 5"
                },
                {
                    title: "calloc (Contiguous Allocation)",
                    content: "<code>calloc</code> does what <code>malloc</code> does, with two differences: it takes the number of elements and the size per element as separate arguments, and it zeroes out every byte before returning. The zero-initialization eliminates an entire category of uninitialized-memory bugs. When you need a clean starting state — arrays you'll accumulate into, counters, flags — <code>calloc</code> saves you from writing a zeroing loop manually.",
                    code: `// malloc: just allocates (garbage values inside)
ptr = (int*)malloc(5 * sizeof(int));

// calloc: allocates AND zeros out memory
// Arguments: (count, size)
ptr = (int*)calloc(5, sizeof(int));`
                },
                {
                    title: "realloc",
                    content: "<code>realloc</code> resizes a previously allocated block. You pass it the original pointer and the new total size you want. If there's enough room in memory right after the current block, it expands in place and returns the same pointer. If not, it allocates a completely new block, copies all the old data over, frees the old block, and returns the new pointer. This is why you must always capture the return value — the address may have changed. Assigning <code>realloc</code>'s result directly back to your original pointer is a common mistake: if <code>realloc</code> returns NULL (failure), you've just lost the only reference to the old block, leaking it permanently.",
                    code: `ptr = (int*)malloc(5 * sizeof(int));
// ... use it ...
// Now we need space for 10 integers
ptr = (int*)realloc(ptr, 10 * sizeof(int));`,
                    tip: "<code>realloc(NULL, size)</code> behaves exactly like <code>malloc(size)</code>. This is guaranteed by the C standard and is occasionally useful — you can write a growth function that works correctly even when called with a NULL pointer the first time, without needing a special case: <code>arr = realloc(arr, newSize * sizeof(int))</code> works whether <code>arr</code> was NULL (first call) or a valid heap pointer (subsequent calls)."
                },
                {
                    title: "Error Handling with errno and perror()",
                    content: "When something goes wrong in a C library function — <code>malloc</code> runs out of memory, <code>fopen</code> can't find the file, a system call fails — the function returns a sentinel value (NULL, -1, etc.) to signal failure. But that doesn't tell you why it failed. The <code>errno</code> variable from <code>&lt;errno.h&gt;</code> fills that gap: the library sets <code>errno</code> to a numeric error code that describes the specific reason for the failure. <code>perror()</code> from <code>&lt;stdio.h&gt;</code> reads <code>errno</code> and prints a human-readable error message.",
                    points: [
                        "<strong><code>errno</code></strong>: A global variable (actually thread-local in modern implementations) that library functions set when they fail. Common values: <code>ENOMEM</code> (out of memory), <code>ENOENT</code> (no such file), <code>EACCES</code> (permission denied), <code>EINVAL</code> (invalid argument).",
                        "<strong><code>perror(str)</code></strong>: Prints <code>str</code> followed by a colon and the human-readable error message corresponding to the current value of <code>errno</code>. The <code>str</code> argument is typically your function name or a short description of the operation that failed. Use this as your first debugging tool whenever a library function fails.",
                        "<strong><code>strerror(errno)</code></strong>: Returns the error string without printing it — useful when you want to include the error in a larger message.",
                        "<strong>Important</strong>: Always check for errors immediately after a failing call. <code>errno</code> can be overwritten by subsequent successful calls. Its value is only meaningful right after a function fails."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>

int main() {
    // Try to open a file that doesn't exist
    FILE *f = fopen("nonexistent_file.txt", "r");
    if (f == NULL) {
        // perror prints: "fopen: No such file or directory"
        perror("fopen");
        
        // strerror lets you use the error in a message
        printf("Error %d: %s\\n", errno, strerror(errno));
        
        return 1;
    }
    fclose(f);
    
    // malloc failure is harder to trigger, but same pattern:
    // ptr = malloc(huge_size);
    // if (ptr == NULL) { perror("malloc"); return 1; }
    
    return 0;
}`,
                    output: "fopen: No such file or directory\nError 2: No such file or directory",
                    tip: "Get into the habit of calling <code>perror()</code> or printing <code>strerror(errno)</code> any time a library function returns NULL or -1. The error message is almost always informative, and it's free — you're just reading a variable that was already set. The alternative is staring at a NULL return with no idea why."
                }
            ]
        },
        {
            id: "function-pointers",
            title: "Function Pointers",
            explanation: "Functions are compiled into machine code that lives at a specific address in memory, just like variables do. That means you can have a pointer that points to a function — store its address, pass it around, and call it indirectly through the pointer. This is the mechanism behind callbacks: passing a function as an argument to another function so that the other function can call it at the right time. It's how C implements things like custom sort comparators, event handlers, and plugin architectures.",
            sections: [
                {
                    title: "The Syntax",
                    content: "Function pointer syntax is the most visually intimidating thing in C, but it follows a consistent pattern once you see it. The key is the parentheses around <code>*name</code> — without them, the <code>*</code> would bind to the return type instead of the name, making it a function that returns a pointer rather than a pointer to a function. The rule to remember: <code>return_type (*pointer_name)(parameter_types)</code>. Once declared and assigned, you call it just like a normal function.",
                    code: `#include <stdio.h>

int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }

int main() {
    int (*operation)(int, int); // Declare function pointer
    
    operation = add;
    printf("Result: %d\\n", operation(10, 5));
    
    operation = subtract;
    printf("Result: %d\\n", operation(10, 5));
    
    return 0;
}`,
                    output: "Result: 15\nResult: 5"
                }
            ]
        },
        {
            id: "alignment-staticassert",
            title: "Memory Alignment, alignas, alignof, and _Static_assert",
            explanation: "Modern CPUs perform best — and sometimes only correctly — when data is aligned to specific byte boundaries. A <code>double</code> on a misaligned address is either slow (extra memory accesses) or a bus error on strict-alignment architectures. C11 and C23 give you the tools to query and control alignment: <code>alignof</code> to inspect, <code>alignas</code> to enforce, and <code>_Static_assert</code> to verify assumptions at compile time so mismatches are caught before they become runtime bugs.",
            sections: [
                {
                    title: "alignof: Querying Alignment Requirements",
                    content: "<code>alignof(T)</code> returns the alignment requirement of type <code>T</code> in bytes — always a power of two. This is the number of bytes by which any object of type <code>T</code> must be aligned. It's a compile-time constant expression.",
                    code: `#include <stdio.h>
#include <stddef.h>    // alignof, max_align_t
#include <stdint.h>

int main(void) {
    // Print alignment requirements for common types
    printf("char:        alignof = %zu\\n", alignof(char));
    printf("short:       alignof = %zu\\n", alignof(short));
    printf("int:         alignof = %zu\\n", alignof(int));
    printf("long:        alignof = %zu\\n", alignof(long));
    printf("long long:   alignof = %zu\\n", alignof(long long));
    printf("float:       alignof = %zu\\n", alignof(float));
    printf("double:      alignof = %zu\\n", alignof(double));
    printf("long double: alignof = %zu\\n", alignof(long double));
    printf("void*:       alignof = %zu\\n", alignof(void*));
    printf("max_align_t: alignof = %zu\\n", alignof(max_align_t));

    // alignof works on structs — returns the largest member alignment
    struct Packet { char type; int length; double data; };
    printf("\\nstruct Packet: alignof = %zu, sizeof = %zu\\n",
           alignof(struct Packet), sizeof(struct Packet));
    return 0;
}`,
                    output: `char:        alignof = 1
short:       alignof = 2
int:         alignof = 4
long:        alignof = 8
long long:   alignof = 8
float:       alignof = 4
double:      alignof = 8
long double: alignof = 16
void*:       alignof = 8
max_align_t: alignof = 16

struct Packet: alignof = 8, sizeof = 24`
                },
                {
                    title: "alignas: Enforcing Alignment (C11/C23)",
                    content: "<code>alignas(N)</code> forces a variable or struct member to be aligned to at least N bytes. Common use cases: SIMD buffers that must be 16- or 32-byte aligned, cache-line padding to avoid false sharing in multithreaded code, and DMA buffers for hardware.",
                    code: `#include <stdio.h>
#include <stddef.h>    // alignas, alignof

// Force 16-byte alignment for SIMD operations
alignas(16) float simd_buffer[4] = {1.0f, 2.0f, 3.0f, 4.0f};

// Cache-line padding: align to 64 bytes to prevent false sharing
// between threads accessing different parts of the same struct
struct alignas(64) CacheAligned {
    int counter;
    char padding[60];  // Fills the rest of the cache line
};

// Stack variable with specific alignment
void demo(void) {
    alignas(32) double aligned_val = 3.14;
    printf("aligned_val address: %p\\n", (void*)&aligned_val);
    printf("aligned_val alignof: %zu\\n", alignof(aligned_val));
    printf("Is 32-byte aligned:  %s\\n",
           (uintptr_t)&aligned_val % 32 == 0 ? "yes" : "no");
}

int main(void) {
    printf("simd_buffer address: %p\\n", (void*)simd_buffer);
    printf("Is 16-byte aligned:  %s\\n",
           (uintptr_t)simd_buffer % 16 == 0 ? "yes" : "no");
    demo();
    return 0;
}`,
                    output: `simd_buffer address: 0x...
Is 16-byte aligned:  yes
aligned_val address: 0x...
aligned_val alignof: 8
Is 32-byte aligned:  yes`,
                    tip: "For heap allocation with specific alignment, use <code>aligned_alloc(alignment, size)</code> from <code>&lt;stdlib.h&gt;</code>. Plain <code>malloc</code> only guarantees alignment to <code>max_align_t</code> (typically 16 bytes on 64-bit systems)."
                },
                {
                    title: "_Static_assert: Compile-Time Verification (C11/C23)",
                    content: "<code>_Static_assert(condition, message)</code> checks a condition at compile time. If false, the build fails with your message. In C23 you can also write it as <code>static_assert</code> without including any header. It's the most powerful tool for encoding assumptions — if a platform change ever violates your assumption, you learn at compile time instead of at 3am during production.",
                    code: `#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

// Verify assumptions about the target platform at compile time
_Static_assert(sizeof(int)    == 4, "int must be 32 bits");
_Static_assert(sizeof(void*)  == 8, "must be a 64-bit platform");
_Static_assert(sizeof(char)   == 1, "char must be 1 byte");
_Static_assert(CHAR_BIT       == 8, "must have 8-bit bytes");

// Verify struct layout for binary protocol compatibility
typedef struct {
    uint8_t  version;   // 1 byte
    uint8_t  flags;     // 1 byte
    uint16_t length;    // 2 bytes
    uint32_t sequence;  // 4 bytes
} PacketHeader;

_Static_assert(sizeof(PacketHeader) == 8,
    "PacketHeader must be exactly 8 bytes for wire protocol");
_Static_assert(alignof(PacketHeader) == 4,
    "PacketHeader must be 4-byte aligned");
_Static_assert(offsetof(PacketHeader, sequence) == 4,
    "sequence field must be at offset 4");

// C23: static_assert without a message is also valid
static_assert(sizeof(uint64_t) == 8);

int main(void) {
    printf("All static assertions passed\\n");
    printf("PacketHeader size:   %zu bytes\\n", sizeof(PacketHeader));
    printf("sequence at offset:  %zu\\n", offsetof(PacketHeader, sequence));
    return 0;
}`,
                    output: `All static assertions passed
PacketHeader size:   8 bytes
sequence at offset:  4`,
                    warning: "Struct layout is not guaranteed unless the compiler is specifically told to pack it. Compilers insert padding between struct members for alignment. Use <code>offsetof</code> and <code>_Static_assert</code> together to verify wire-protocol struct layouts, especially when receiving data over the network or from files."
                }
            ]
        },
        {
            id: "compiler-warnings",
            title: "Using the Compiler as Your First Debugger",
            explanation: "The C compiler is not just a translator — it's the most powerful static analysis tool you have, and it's free. But its default behavior is to stay quiet about suspicious code. The flags you pass at compile time determine whether you get a silent binary or a detailed report of every questionable pattern in your code. Professional C development means always compiling with warnings enabled and treating warnings as errors.",
            sections: [
                {
                    title: "The Essential Warning Flags",
                    content: "GCC and Clang share a common set of warning flags. These are the ones every C developer should use by default:",
                    points: [
                        "<code>-Wall</code>: Enables a curated set of 'important' warnings. Despite the name, it does not enable <em>all</em> warnings — just the ones GCC considers high-signal.",
                        "<code>-Wextra</code>: Enables additional warnings that <code>-Wall</code> misses: unused parameters, missing field initializers, sign comparison mismatches, and more.",
                        "<code>-Wconversion</code>: Warns whenever a value is implicitly converted in a way that could silently lose data — e.g. assigning a <code>double</code> to an <code>int</code>, or a <code>long</code> to a <code>short</code>.",
                        "<code>-Wshadow</code>: Warns when a local variable shadows an outer variable of the same name — a common source of subtle bugs.",
                        "<code>-Werror</code>: Promotes all warnings to hard errors. The build fails until every warning is fixed. This is what 'zero warnings' actually means in practice.",
                        "<code>-pedantic</code> or <code>-Wpedantic</code>: Enforces strict conformance to the C standard and warns about GNU extensions."
                    ],
                    code: `// Compile with:
// gcc -std=c23 -Wall -Wextra -Wconversion -Wshadow -Werror program.c

#include <stdio.h>

// -Wconversion catches this:
void bad_conversion(void) {
    double d = 3.99;
    int    i = d;      // WARNING: implicit conversion from double to int loses .99
    printf("%d\n", i);
}

// -Wshadow catches this:
int x = 10;           // global x
void shadow_example(void) {
    int x = 20;        // WARNING: 'x' shadows outer variable
    printf("%d\n", x);
}

// -Wall catches this:
int maybe_uninit(int flag) {
    int result;
    if (flag) result = 1;
    return result;     // WARNING: may be used uninitialized
}

int main(void) {
    bad_conversion();
    shadow_example();
    printf("%d\n", maybe_uninit(1));
    return 0;
}`,
                    warning: "Adding <code>-Werror</code> to existing codebases can be brutal — you may suddenly have hundreds of errors to fix. The pragmatic approach: add it to new projects from day one, and add warnings incrementally to existing projects module by module."
                },
                {
                    title: "Reading Compiler Error Messages",
                    content: "GCC and Clang error messages follow a consistent format: <code>filename:line:column: severity: message</code>. Learning to read them efficiently saves enormous debugging time. Clang's errors are generally cleaner and more actionable than GCC's.",
                    code: `// This broken program produces several instructive errors:
#include <stdio.h>

int add(int a, int b) {
    return a + b
}                        // ERROR: expected ';' before '}'

int main(void) {
    int result = add(1, 2, 3);  // ERROR: too many arguments
    printf("%s\n", result);     // WARNING: format '%s' expects char*, got int
    
    int *p = NULL;
    *p = 5;                      // No compile error, but runtime crash (null deref)
    
    return 0
}                        // ERROR: expected ';' before '}'`,
                    output: `program.c:5:1: error: expected ';' before '}'
program.c:9:28: error: too many arguments to function 'add'
program.c:10:20: warning: format '%s' expects 'char *' but arg has type 'int'
program.c:15:1: error: expected ';' before '}'`,
                    tip: "Always fix the <em>first</em> error first. A single missing bracket or semicolon causes a cascade of false errors on subsequent lines. Fix one, recompile, repeat. Chasing the fifth error when the first is still there is wasted effort."
                },
                {
                    title: "Runtime Analysis Tools: AddressSanitizer and UBSan",
                    content: "Some bugs can't be caught at compile time because they depend on runtime values. AddressSanitizer (ASan) and Undefined Behavior Sanitizer (UBSan) are compiler-instrumented runtime checkers that catch bugs the compiler itself can't diagnose — with minimal setup.",
                    points: [
                        "<code>-fsanitize=address</code>: AddressSanitizer. Catches heap buffer overflows, stack buffer overflows, use-after-free, use-after-return, and memory leaks. Typically 2× slowdown. Use during development and testing.",
                        "<code>-fsanitize=undefined</code>: UBSan. Catches signed integer overflow, null pointer dereference, misaligned access, array index out of bounds, and more. Very low overhead.",
                        "<code>-fsanitize=address,undefined</code>: Combine both. The standard practice for test builds.",
                        "<code>-g</code>: Always add debug symbols when using sanitizers so error messages show file names and line numbers."
                    ],
                    code: `// Compile: gcc -std=c23 -g -fsanitize=address,undefined -o prog prog.c

#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int arr[5] = {1, 2, 3, 4, 5};
    
    // UBSan catches this at runtime:
    printf("%d\n", arr[10]);   // out-of-bounds
    
    // ASan catches this at runtime:
    int *p = malloc(sizeof(int));
    *p = 42;
    free(p);
    printf("%d\n", *p);        // use-after-free
    
    return 0;
}`,
                    output: `RUNTIME ERROR: index 10 out of bounds for type 'int[5]'
  at prog.c:9
=================================================================
ERROR: AddressSanitizer: heap-use-after-free on address 0x... at pc ...
READ of size 4 at 0x... thread T0
  #0 main prog.c:15`,
                    tip: "The standard professional workflow: <strong>develop</strong> with <code>-Wall -Wextra -Werror</code>, <strong>test</strong> with <code>-fsanitize=address,undefined -g</code>, <strong>release</strong> with <code>-O2 -DNDEBUG</code>. These three build configurations catch the vast majority of C bugs before they reach production."
                }
            ]
        },
        {
            id: "undefined-behavior",
            title: "Undefined Behavior: What It Is and Why It Matters",
            explanation: "Undefined behavior (UB) is the single most dangerous concept in C. When your code invokes UB, the C standard places <em>no requirements</em> on what happens — the compiler may produce any output, silently corrupt memory, erase data, or generate code that works perfectly in debug mode and catastrophically fails in release. UB is not a runtime error you can catch — it's a contract violation that the compiler is allowed to assume never happens, and it uses that assumption to generate faster, smaller code. Understanding UB is what separates C programmers who ship reliable software from those who get lucky.",
            sections: [
                {
                    title: "The Abstract Machine",
                    content: "C doesn't describe what your CPU does. It describes an <strong>abstract machine</strong> — a fictional computer with specific rules. The compiler's job is to generate real machine code that behaves identically to the abstract machine <em>for well-defined programs</em>. For programs with UB, the abstract machine makes no promises at all. The compiler is not required to diagnose UB, warn about it, or handle it gracefully. It can — and does — use UB as a license to optimize aggressively.",
                    points: [
                        "<strong>UB is a compile-time contract, not a runtime check.</strong> The compiler assumes UB never happens. If it does, all bets are off — the resulting binary may do anything.",
                        "<strong>UB is not the same as implementation-defined behavior.</strong> Implementation-defined means the compiler must document what it does (e.g. <code>sizeof(int)</code> on a specific platform). UB means no documentation required — anything can happen.",
                        "<strong>UB can reach backward in time.</strong> Because the compiler can reorder and eliminate code based on UB assumptions, a bug on line 50 can corrupt results that were printed on line 10. This is why UB bugs are so hard to find.",
                        "<strong>Debug and release builds differ.</strong> UB often appears to work in debug builds (where optimization is off) and silently fails in release builds (where the optimizer exploits UB assumptions). Never use 'it works in debug' as a correctness argument."
                    ]
                },
                {
                    title: "The Most Common Forms of UB",
                    content: "These are the UB categories that appear most frequently in real C code. Each has a specific rule it violates in the C standard.",
                    points: [
                        "<strong>Signed integer overflow</strong>: <code>INT_MAX + 1</code> is UB. The compiler assumes signed overflow never happens — it uses this to prove loop termination and eliminate overflow checks. <em>Unsigned</em> overflow is defined: it wraps modulo 2^N.",
                        "<strong>Out-of-bounds array access</strong>: Reading or writing past the end of an array. The most common source of security vulnerabilities in C code.",
                        "<strong>Use after free</strong>: Accessing memory after <code>free()</code>. The allocator may have given that memory to someone else.",
                        "<strong>Null pointer dereference</strong>: <code>*ptr</code> when ptr is NULL. The compiler may eliminate null checks entirely based on the assumption you never do this.",
                        "<strong>Uninitialized reads</strong>: Reading a variable that was never written. The value is not just unpredictable — the behavior of the entire program becomes undefined.",
                        "<strong>Data races</strong>: Two threads reading and writing the same memory without synchronization (without <code>_Atomic</code> or a mutex). Results are undefined even if one of the accesses is a read.",
                        "<strong>Strict aliasing violation</strong>: Accessing the same memory through two pointers of incompatible types (e.g. reading a <code>float</code> through an <code>int*</code>). The compiler assumes pointers of different types don't alias and optimizes accordingly."
                    ],
                    code: `#include <stdio.h>
#include <limits.h>

int main(void) {
    // UB: signed integer overflow
    int x = INT_MAX;
    int y = x + 1;          // UB — compiler may assume this never happens
    printf("%d\\n", y);      // Could print anything, or be eliminated

    // UB: use of uninitialized variable
    int uninit;
    printf("%d\\n", uninit); // UB — not just a garbage value; the compiler
                             // may generate wrong code for the whole function

    // DEFINED: unsigned wraparound
    unsigned int u = UINT_MAX;
    unsigned int w = u + 1;  // Defined: wraps to 0
    printf("%u\\n", w);       // Always prints 0

    return 0;
}`,
                    output: "(signed overflow and uninit: undefined — anything can happen)\n0",
                    warning: "The signed overflow and uninitialized read examples above are UB. On many platforms in debug mode they appear to 'work' — but this is accidental. Compile with <code>-fsanitize=undefined</code> and they'll be caught at runtime. Compile with <code>-O2</code> and the optimizer may make them do something completely unexpected."
                },
                {
                    title: "How the Compiler Exploits UB",
                    content: "This is the part that surprises most C programmers. The compiler actively uses UB assumptions to eliminate code and reorder operations — and it's allowed to do so.",
                    code: `#include <stdio.h>
#include <limits.h>

// The optimizer sees: if i > i+1, that would be signed overflow (UB).
// Therefore i > i+1 can never be true for a valid program.
// Therefore the if branch can be eliminated entirely.
void surprise(int i) {
    if (i > i + 1) {
        printf("This line may be compiled away entirely\\n");
    }
}

// The optimizer sees: ptr != NULL was checked, so ptr is not NULL here.
// A later null check on the same pointer is redundant — eliminated.
void eliminate_check(int *ptr) {
    *ptr = 42;           // If we get here, ptr is not null (null deref = UB)
    if (ptr == NULL) {   // This check is eliminated: ptr can't be null
        printf("never\\n"); // because derefing null above would be UB
    }
}

int main(void) {
    surprise(INT_MAX);   // No output
    int x = 1;
    eliminate_check(&x); // "never" never prints
    return 0;
}`,
                    output: "(no output — both branches eliminated by optimizer)",
                    tip: "This is not a compiler bug — this is the compiler doing exactly what the standard allows. The programmer wrote UB; the compiler assumed it doesn't happen; the optimization followed logically. The solution is never to write UB, not to blame the compiler."
                },
                {
                    title: "Sanitizers: Your UB Detection Tools",
                    content: "The compiler can instrument your binary to detect UB at runtime. These sanitizers add checks that catch UB as it happens, turning silent corruption into immediate crashes with stack traces.",
                    points: [
                        "<strong>AddressSanitizer (ASan)</strong>: <code>-fsanitize=address</code> — Detects out-of-bounds reads/writes, use-after-free, double-free, use-after-return. ~2x slowdown. The most essential sanitizer for C.",
                        "<strong>UndefinedBehaviorSanitizer (UBSan)</strong>: <code>-fsanitize=undefined</code> — Detects signed overflow, shift out of bounds, null dereferences, invalid casts, misaligned access. Very low overhead (~10%).",
                        "<strong>MemorySanitizer (MSan)</strong>: <code>-fsanitize=memory</code> — Detects reads of uninitialized memory. ~3x slowdown. Clang only.",
                        "<strong>ThreadSanitizer (TSan)</strong>: <code>-fsanitize=thread</code> — Detects data races. ~5-15x slowdown. Essential for multithreaded code.",
                        "<strong>Valgrind</strong>: Not a compiler flag — a separate tool. Slower than ASan but requires no recompilation. Run with <code>valgrind --leak-check=full ./program</code>."
                    ],
                    code: `/* Compile: gcc -fsanitize=address,undefined -g -o prog prog.c
   Run:     ./prog

   ASan output on overflow:
   ==ERROR== AddressSanitizer: heap-buffer-overflow
   WRITE of size 4 at 0x... pc 0x... (main+0x...)

   UBSan output on signed overflow:
   prog.c:5:16: runtime error: signed integer overflow:
   2147483647 + 1 cannot be represented in type 'int'
*/

#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *arr = malloc(3 * sizeof(int));
    // UB: write past end of 3-element array
    arr[3] = 42;   // ASan catches this immediately
    free(arr);
    return 0;
}`,
                    tip: "Make sanitizers part of your normal development loop, not a one-time check. Add them to your debug build configuration permanently: <code>CFLAGS = -Wall -Wextra -Werror -g -fsanitize=address,undefined</code>. The small performance cost in dev is worth catching bugs before they ship."
                }
            ]
        }
    ],
    
    quiz: [
        {
            question: "What does the & operator return?",
            options: ["The value of the variable", "The address of the variable", "The size of the variable", "The pointer itself"],
            answer: 1,
            explanation: "The & (address-of) operator returns the memory address of a variable — a pointer to where that variable lives in RAM."
        },
        {
            question: "What is dereferencing?",
            options: ["Creating a pointer", "Accessing the value at the address", "Deleting a pointer", "Assigning an address"],
            answer: 1,
            explanation: "Dereferencing a pointer (using *ptr) accesses or modifies the value at the address the pointer holds. It 'follows' the pointer to what it points to."
        },
        {
            question: "If ptr points to an int (4 bytes), what is ptr + 1?",
            options: ["ptr address + 1 byte", "ptr address + 4 bytes", "ptr value + 1", "Compiler error"],
            answer: 1,
            explanation: "Pointer arithmetic advances by the size of the pointed-to type. int is 4 bytes, so ptr+1 advances 4 bytes — to the next int."
        },
        {
            question: "Where does malloc allocate memory from?",
            options: ["Stack", "Heap", "Code Segment", "Register"],
            answer: 1,
            explanation: "malloc allocates from the heap (free store). Stack memory is for local variables and is automatically freed when functions return."
        },
        {
            question: "What happens if you forget to free memory?",
            options: ["Compiler Error", "Segmentation Fault", "Memory Leak", "Nothing"],
            answer: 2,
            explanation: "Forgetting to free dynamically allocated memory causes a memory leak — the memory stays allocated for the lifetime of the program, wasting RAM."
        },
        {
            question: "What is the difference between malloc and calloc?",
            options: ["malloc is faster", "calloc initializes memory to zero", "malloc zeros memory", "calloc is for chars only"],
            answer: 1,
            explanation: "malloc allocates uninitialized memory (contents are garbage). calloc allocates and zero-initializes all bytes. Use calloc when you need clean memory."
        },
        {
            question: "What does free(ptr) do?",
            options: ["Deletes the pointer variable", "Returns memory to the heap", "Changes the value to 0", "Stops the program"],
            answer: 1,
            explanation: "free(ptr) returns the allocated block to the allocator's pool. The pointer itself still holds the old address (a dangling pointer) — you should set it to NULL after freeing."
        },
        {
            question: "What happens if you dereference a NULL pointer?",
            options: ["Returns 0", "Nothing", "Segmentation Fault (Crash)", "Memory Leak"],
            answer: 2,
            explanation: "Dereferencing NULL is undefined behavior — on most systems it causes a segmentation fault (SIGSEGV), crashing the program immediately."
        },
        {
            question: "What does pointer subtraction (ptr2 - ptr1) return?",
            options: ["Byte difference", "Number of elements between them", "ptrdiff_t in bytes", "Always negative"],
            answer: 1,
            explanation: "Pointer subtraction gives the number of elements between two pointers (as ptrdiff_t), not bytes. Both pointers must point into the same array."
        },
        {
            question: "What does perror() do?",
            options: ["Prints a custom error and exits", "Prints the system error message for the current errno", "Clears errno", "Returns the errno value"],
            answer: 1,
            explanation: "perror prints a human-readable description of the last error set in errno, prefixed by your string. Essential for diagnosing failed system calls."
        },
        {
            question: "Signed integer overflow in C is:",
            options: ["Defined: wraps like unsigned", "Undefined behavior — compiler may assume it never happens", "Implementation-defined on all platforms", "A compile-time error"],
            answer: 1,
            explanation: "Signed overflow is UB. The compiler uses this assumption to optimize — it may eliminate overflow checks or produce completely unexpected results. Unsigned overflow wraps modulo 2^N and is well-defined."
        },
        {
            question: "Which flag combination catches memory errors AND undefined behavior at runtime?",
            options: ["-O2 -DNDEBUG", "-Wall -Wextra", "-fsanitize=address,undefined -g", "-pedantic -std=c23"],
            answer: 2,
            explanation: "AddressSanitizer catches buffer overflows and use-after-free. UBSan catches signed overflow, null dereferences, and misalignment. -g adds debug info for readable stack traces."
        },
        {
            question: "Why can UB appear to corrupt results on lines BEFORE the problematic statement?",
            options: ["It cannot — UB only affects later lines", "The CPU executes instructions out of order", "The optimizer reorders or eliminates code based on UB assumptions, affecting earlier behavior", "It is a debugger display artifact"],
            answer: 2,
            explanation: "The optimizer reasons globally. If it determines a value can only exist through a UB path, it may eliminate preceding checks. The binary can behave differently from the source even for lines written before the UB."
        }
    ],
    
    practice: [
        {
            title: "Pointer Swap",
            difficulty: "easy",
            problem: "Write a function that takes two int pointers and swaps the values they point to.",
            solution: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x=5, y=10;
    swap(&x, &y);
    printf("x=%d, y=%d\\n", x, y);
    return 0;
}`
        },
        {
            title: "Dynamic Array Sum",
            difficulty: "medium",
            problem: "Ask the user for a size N. Allocate an array of size N using malloc. Fill it with user input. Print the sum. Free the memory. Handle allocation failure with perror().",
            solution: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    printf("Enter size: ");
    scanf("%d", &n);
    
    int *arr = (int*)malloc(n * sizeof(int));
    if(!arr) {
        perror("malloc");
        return 1;
    }
    
    int sum = 0;
    printf("Enter %d numbers: ", n);
    for(int i=0; i<n; i++) {
        scanf("%d", &arr[i]);
        sum += arr[i];
    }
    
    printf("Sum: %d\\n", sum);
    free(arr);
    arr = NULL;
    return 0;
}`
        },
        {
            title: "Find Maximum Using Pointers",
            difficulty: "medium",
            problem: "Write a function that takes an int pointer (start) and a size, and returns the maximum value in that array using pointer arithmetic (not []).",
            solution: `#include <stdio.h>

int findMax(int *ptr, int size) {
    int max = *ptr;
    for(int i=1; i<size; i++) {
        if(*(ptr + i) > max) {
            max = *(ptr + i);
        }
    }
    return max;
}

int main() {
    int arr[] = {5, 2, 9, 1, 7};
    printf("Max: %d\\n", findMax(arr, 5));
    return 0;
}`
        },
        {
            title: "Search and Index",
            difficulty: "medium",
            problem: "Write a function that searches an int array for a target value using a pointer loop, and returns the index using pointer subtraction. Return -1 if not found.",
            solution: `#include <stdio.h>
#include <stddef.h>

int searchIndex(int *arr, int size, int target) {
    int *end = arr + size;
    for (int *p = arr; p < end; p++) {
        if (*p == target) {
            return (int)(p - arr); // Pointer subtraction gives index
        }
    }
    return -1;
}

int main() {
    int data[] = {10, 25, 37, 42, 99};
    printf("Index of 37: %d\\n", searchIndex(data, 5, 37)); // 2
    printf("Index of 99: %d\\n", searchIndex(data, 5, 99)); // 4
    printf("Index of 50: %d\\n", searchIndex(data, 5, 50)); // -1
    return 0;
}`
        }
    ],
    
    exam: [
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int x = 42;
    int *p = &x;
    printf("%d\\n", *p);
    *p = 100;
    printf("%d\\n", x);
    return 0;
}`,
            options: ["42 then 42", "42 then 100", "100 then 100", "100 then 42"],
            answer: 1,
            explanation: "*p dereferences to read x's value: 42. *p = 100 writes through the pointer, changing x itself. So x is now 100."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
void double_it(int *n) {
    *n = *n * 2;
}
int main(void) {
    int x = 7;
    double_it(&x);
    printf("%d\\n", x);
    return 0;
}`,
            options: ["7", "14", "49", "Undefined"],
            answer: 1,
            explanation: "&x passes the address of x. Inside double_it, *n = *n * 2 modifies x through the pointer. x becomes 14."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int arr[] = {5, 10, 15, 20};
    int *p = arr;
    printf("%d\\n", *p);
    p++;
    printf("%d\\n", *p);
    p += 2;
    printf("%d\\n", *p);
    return 0;
}`,
            options: ["5 then 10 then 20", "5 then 10 then 15", "5 then 15 then 20", "5 then 6 then 8"],
            answer: 0,
            explanation: "p starts at arr[0]=5. p++ moves to arr[1]=10. p+=2 moves to arr[3]=20. Pointer arithmetic advances by element size."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *arr = malloc(3 * sizeof(int));
    arr[0] = 1; arr[1] = 2; arr[2] = 3;
    printf("%d %d %d\\n", arr[0], arr[1], arr[2]);
    free(arr);
    return 0;
}`,
            options: ["1 2 3", "0 0 0", "Undefined", "Crash"],
            answer: 0,
            explanation: "malloc allocates space for 3 ints on the heap. Assigning and printing through array indexing works identically to stack arrays. free releases the memory."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int arr[] = {1, 2, 3, 4, 5};
    int *p = arr;
    int *q = arr + 5;
    printf("%td\\n", q - p);
    return 0;
}`,
            options: ["5", "20", "4", "1"],
            answer: 0,
            explanation: "Pointer subtraction gives the number of elements between the pointers (not bytes). arr+5 is one past the end, so q-p = 5 elements."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *p = calloc(4, sizeof(int));
    printf("%d %d\\n", p[0], p[2]);
    p[1] = 99;
    printf("%d\\n", p[1]);
    free(p);
    return 0;
}`,
            options: ["0 0 then 99", "Undefined then 99", "1 1 then 99", "0 0 then 0"],
            answer: 0,
            explanation: "calloc zero-initializes memory: all 4 ints start as 0. After p[1]=99, that element is 99. First printf: 0 0. Second: 99."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int add(int a, int b)  { return a + b; }
int mul(int a, int b)  { return a * b; }
int main(void) {
    int (*op)(int, int) = add;
    printf("%d\\n", op(3, 4));
    op = mul;
    printf("%d\\n", op(3, 4));
    return 0;
}`,
            options: ["7 then 12", "12 then 7", "7 then 7", "12 then 12"],
            answer: 0,
            explanation: "Function pointer op first points to add: op(3,4) = 7. Then reassigned to mul: op(3,4) = 12."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    const int x = 10;
    const int *p = &x;
    printf("%d\\n", *p);
    // *p = 20;  // would be a compile error
    int y = 20;
    p = &y;
    printf("%d\\n", *p);
    return 0;
}`,
            options: ["10 then 20", "10 then 10", "20 then 20", "Compile error"],
            answer: 0,
            explanation: "const int *p means the pointed-to value is read-only through p, but p itself can be reassigned. *p prints x=10, then p is pointed to y=20."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stddef.h>
struct Point { char flag; double x; };
int main(void) {
    printf("%zu\\n", sizeof(struct Point));
    printf("%zu\\n", offsetof(struct Point, x));
    return 0;
}`,
            options: ["9 then 1", "16 then 8", "10 then 1", "16 then 1"],
            answer: 1,
            explanation: "char (1 byte) is followed by 7 bytes of padding to align double (8-byte aligned). Total size: 16. x starts at offset 8."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *p = malloc(sizeof(int));
    *p = 42;
    int *q = p;
    free(p);
    // q is now a dangling pointer
    printf("freed\\n");
    return 0;
}`,
            options: ["42", "freed", "Crash immediately", "Undefined behavior on free"],
            answer: 1,
            explanation: "free(p) releases the memory. printf runs after that and prints 'freed'. q is a dangling pointer but we don't dereference it here, so no crash — just a bug waiting to happen."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *arr = malloc(3 * sizeof(int));
    arr[0]=10; arr[1]=20; arr[2]=30;
    arr = realloc(arr, 5 * sizeof(int));
    arr[3]=40; arr[4]=50;
    for (int i=0; i<5; i++) printf("%d ", arr[i]);
    free(arr);
    return 0;
}`,
            options: ["10 20 30 40 50", "10 20 30 0 0", "0 0 0 40 50", "Undefined"],
            answer: 0,
            explanation: "realloc extends the allocation to 5 ints. The first 3 elements are preserved. New elements are set to 40 and 50 explicitly."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <stddef.h>
int main(void) {
    alignas(16) double d = 3.14;
    printf("%zu\\n", alignof(double));
    printf("%d\\n", (int)((uintptr_t)&d % 16 == 0));
    return 0;
}`,
            options: ["8 then 0", "8 then 1", "16 then 1", "16 then 0"],
            answer: 1,
            explanation: "alignof(double) is 8 (natural alignment). alignas(16) forces the address to be a multiple of 16, so &d % 16 == 0 is true (1)."
        }
    ]
};

window.ModuleLowLevel = ModuleLowLevel;