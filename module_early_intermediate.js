const ModuleEarlyIntermediate = {
    description: "Controlling program flow with loops, organizing code with functions, and handling lists of data with arrays. This is where C starts feeling like a real programming language instead of a novelty.",
    
    lessons: [
        {
            id: "loops",
            title: "Loops",
            explanation: "Imagine you have to print 'Hello' 100 times. Writing <code>printf</code> 100 times would be stupid, time-consuming, and embarrassing to show anyone. Loops solve this by repeating a block of code automatically. This concept is called <strong>Iteration</strong>, and it's one of the most powerful ideas in all of programming.",
            sections: [
                {
                    title: "The While Loop",
                    content: "The <code>while</code> loop is the simplest loop. Think of it as an <code>if</code> statement that refuses to stop until the condition is false. It checks the condition first, runs the block if true, then goes back and checks again. Repeat until the condition fails, then move on.",
                    points: [
                        "<strong>Syntax</strong>: <code>while (condition) { ... }</code> — as long as the condition is true (non-zero), the block keeps running.",
                        "<strong>Rule</strong>: Every time the block finishes executing, the condition is checked again from scratch. If it's still true, another round begins.",
                        "<strong>Danger</strong>: If nothing inside the loop ever makes the condition false, you have an <strong>Infinite Loop</strong>. The program will run forever, consuming CPU, and the only way out is killing the process. This is not a theoretical concern — it happens to everyone."
                    ],
                    code: `#include <stdio.h>

int main() {
    int countdown = 5;
    
    // "While countdown is greater than 0, do this"
    while (countdown > 0) {
        printf("%d...\\n", countdown);
        countdown--; // CRITICAL: Subtract 1 each time
    }
    
    printf("Blastoff!\\n");
    return 0;
}`,
                    output: "5...\n4...\n3...\n2...\n1...\nBlastoff!",
                    warning: "If you forget <code>countdown--;</code>, the value stays 5 forever. The condition <code>countdown > 0</code> is always true, the loop never stops, and your program becomes an expensive space heater. Always make sure something inside the loop moves you toward the exit condition."
                },
                {
                    title: "The For Loop",
                    content: "The <code>for</code> loop is the loop you'll use most often. It's designed for situations where you know exactly how many iterations you want — 'do this 10 times', 'go through every element of this array'. It bundles the three things every counted loop needs into one clean line: where to start, when to stop, and how to advance.",
                    points: [
                        "<strong>Initialization</strong>: Runs exactly once, before the loop starts. This is where you create and set your counter variable (e.g., <code>int i = 0</code>). The variable <code>i</code> is conventional but not required — it stands for 'index'.",
                        "<strong>Condition</strong>: Checked before every single iteration. If true, the body runs. If false, the loop ends immediately. If false on the very first check, the body never runs at all.",
                        "<strong>Update</strong>: Runs after every iteration, just before the condition is checked again. Usually <code>i++</code>, but you can do anything here — count down, skip by 2, whatever the problem demands."
                    ],
                    code: `#include <stdio.h>

int main() {
    // (Start at 1; Keep going while <= 5; Add 1 each time)
    for (int i = 1; i <= 5; i++) {
        printf("Iteration number %d\\n", i);
    }
    
    return 0;
}`,
                    output: "Iteration number 1\nIteration number 2\nIteration number 3\nIteration number 4\nIteration number 5"
                },
                {
                    title: "Do-While Loop",
                    content: "The do-while loop is the oddball of the family. Unlike <code>while</code> and <code>for</code>, which check the condition before running the body, the do-while checks the condition after. This guarantees the body runs at least once, no matter what. The practical use case is almost always interactive menus: you always need to display the menu at least once before you know what the user chose.",
                    code: `#include <stdio.h>

int main() {
    int choice;
    
    do {
        printf("1. Play Game\\n");
        printf("2. Exit\\n");
        printf("Enter choice: ");
        scanf("%d", &choice);
    } while (choice != 2); // Keep going if they didn't pick 2
    
    printf("Goodbye!\\n");
    return 0;
}`
                },
                {
                    title: "Nested Loops",
                    content: "You can put a loop inside another loop. The inner loop runs to completion for every single iteration of the outer loop. The classic mental model: a clock. For every one move of the hour hand, the minute hand completes a full 60-step cycle. Same idea here. For every round of the outer loop, the inner loop does all of its rounds. The total number of iterations is outer × inner.",
                    code: `#include <stdio.h>

int main() {
    // Outer loop runs 3 times (Rows)
    for (int i = 1; i <= 3; i++) {
        // Inner loop runs 5 times (Columns)
        for (int j = 1; j <= 5; j++) {
            printf("* ");
        }
        // Print a newline after each row is finished
        printf("\\n");
    }
    return 0;
}`,
                    output: "* * * * * \n* * * * * \n* * * * * "
                }
            ]
        },
        {
            id: "break-continue",
            title: "Loop Control",
            explanation: "Loops run until their condition becomes false — that's the normal path. But sometimes you need to deviate: exit a loop early because you found what you were looking for, or skip the rest of the current iteration because the current value is useless. <code>break</code> and <code>continue</code> give you that control.",
            sections: [
                {
                    title: "Break",
                    content: "The <code>break</code> statement is an emergency exit. The moment the program hits <code>break</code>, it immediately leaves the loop — no remaining iterations, no condition check, nothing. Execution jumps to whatever code comes after the loop's closing brace. This is useful when you're searching for something: once you've found it, there's no reason to keep looking.",
                    code: `#include <stdio.h>

int main() {
    for (int i = 0; i < 10; i++) {
        if (i == 4) {
            printf("Stopping early!\\n");
            break; // Exit the loop right now
        }
        printf("%d ", i);
    }
    return 0;
}`,
                    output: "0 1 2 3 Stopping early!"
                },
                {
                    title: "Continue",
                    content: "The <code>continue</code> statement doesn't exit the loop — it just skips the rest of the current iteration and jumps back to the top to start the next one. Think of it as 'this value is not worth my time, move on'. The loop itself continues normally; only the current pass is cut short. In a <code>for</code> loop, the update step (<code>i++</code>) still runs after a <code>continue</code>.",
                    code: `#include <stdio.h>

int main() {
    // Print only odd numbers
    for (int i = 0; i < 10; i++) {
        // If i is even, skip the print statement
        if (i % 2 == 0) {
            continue; // Jump to i++ immediately
        }
        printf("%d ", i);
    }
    return 0;
}`,
                    output: "1 3 5 7 9"
                }
            ]
        },
        {
            id: "functions",
            title: "Functions",
            explanation: "Functions are reusable, named blocks of code that do a specific job. Instead of copying and pasting the same logic in three different places (and then having to fix it in three places when it breaks), you write it once as a function and call it whenever you need it. This is the <strong>DRY Principle</strong> — Don't Repeat Yourself. It's one of the most important principles in all of software development, and functions are the primary tool for following it in C.",
            sections: [
                {
                    title: "Anatomy of a Function",
                    content: "A function is like a vending machine: you put something in (arguments), it does work, and it gives something back (return value). To create one, you define four things: what it returns, what it's called, what it takes as input, and what it does.",
                    points: [
                        "<strong>Return Type</strong>: The data type of the value the function sends back to the caller. <code>int</code> if it returns a whole number, <code>float</code> for decimals, <code>char</code> for a character, and <code>void</code> if it doesn't return anything at all.",
                        "<strong>Name</strong>: How you refer to the function when calling it. Same naming rules as variables — descriptive names like <code>calculateArea</code> are far better than <code>f</code>.",
                        "<strong>Parameters</strong>: The variables that hold whatever values you pass in. They exist only for the duration of that function call. They're the function's inputs."
                    ],
                    code: `#include <stdio.h>

// Function Definition (The Blueprint)
int add(int a, int b) {
    int sum = a + b;
    return sum; // Send the result back
}

int main() {
    int result;
    
    result = add(10, 20); 
    printf("Result: %d\\n", result);
    
    result = add(5, 7);
    printf("Another result: %d\\n", result);
    
    return 0;
}`,
                    output: "Result: 30\nAnother result: 12"
                },
                {
                    title: "Void Functions",
                    content: "Not every function needs to calculate and return a value. Sometimes you just want to perform an action — print something, draw a separator line, update a display. Functions that do work without returning a value use the <code>void</code> return type. You can't use them on the right side of an assignment, and you don't write a <code>return</code> statement (or you write <code>return;</code> with no value if you want to exit early).",
                    code: `#include <stdio.h>

// No return value needed
void greet(char name[]) {
    printf("Hello, %s!\\n", name);
}

int main() {
    greet("Alice");
    greet("Bob");
    return 0;
}`,
                    output: "Hello, Alice!\nHello, Bob!"
                },
                {
                    title: "Pass by Value",
                    content: "In C, when you pass a variable to a function, the function receives a full, independent copy of that value. It does not get the original. Whatever the function does to its copy — modifying it, zeroing it, multiplying it by a thousand — has zero effect on the variable that was passed in. They are completely separate after the copy is made.",
                    code: `#include <stdio.h>

void tryToChange(int x) {
    x = 100; // This changes the COPY, not the original
    printf("Inside function: %d\\n", x);
}

int main() {
    int num = 5;
    tryToChange(num);
    
    // num is still 5!
    printf("Inside main: %d\\n", num);
    return 0;
}`,
                    output: "Inside function: 100\nInside main: 5",
                    tip: "This is not a limitation to work around — it's actually useful. Functions being isolated from their callers prevents a lot of accidental bugs. But sometimes you genuinely need a function to modify the original variable. To do that, you pass the variable's memory address instead of its value, which is the entire point of pointers. We cover that in the Low-Level module, and it will make this moment click into place."
                },
                {
                    title: "Function Prototypes",
                    content: "C reads source files from top to bottom. If you call a function before the compiler has seen its definition, the compiler doesn't know what that function looks like — what it returns, how many arguments it takes, what types those arguments are. A <strong>function prototype</strong> is a forward declaration that tells the compiler 'this function exists and here's its signature' without providing the actual body yet. The body can then appear later in the file — or even in a completely different file.",
                    points: [
                        "<strong>Syntax</strong>: The return type, function name, and parameter types — exactly like the first line of the function definition, but ending with a semicolon instead of opening a body with <code>{</code>.",
                        "<strong>Why it matters</strong>: Without a prototype, calling a function before the compiler has seen it is undefined behavior in older C standards and an error in newer ones. Prototypes fix this cleanly.",
                        "<strong>Header files are just prototypes</strong>: When you write <code>#include &lt;stdio.h&gt;</code>, you're including a file full of prototypes for functions like <code>printf</code> and <code>scanf</code>. The actual implementations live in a compiled library. The prototype is what lets your code compile without seeing that implementation."
                    ],
                    code: `#include <stdio.h>

// PROTOTYPE: Tells the compiler add() exists and what it looks like.
int add(int a, int b);

int main() {
    // Works now even though add() is defined BELOW main.
    int result = add(10, 20);
    printf("Result: %d\\n", result);
    return 0;
}

// DEFINITION: The actual body, appearing after main.
int add(int a, int b) {
    return a + b;
}`,
                    output: "Result: 30",
                    tip: "The common convention is to put all your prototypes at the top of the file (or in a separate <code>.h</code> header file), then define <code>main</code>, then write all your function implementations below it. This way <code>main</code> — the logical entry point — sits near the top of the file where it's easy to find."
                }
            ]
        },
        {
            id: "arrays",
            title: "Arrays",
            explanation: "An array is a collection of variables of the <strong>same type</strong> stored contiguously in memory — one right after another, no gaps. Instead of declaring 10 separate integer variables, you declare one array of 10 integers. Think of it as a row of numbered lockers: all the same size, right next to each other, each identified by its number.",
            sections: [
                {
                    title: "Declaration and Access",
                    content: "Arrays are declared with the type, a name, and the size in square brackets. Each element is accessed using an index — its position number. The critical thing to internalize immediately: <strong>C arrays start at index 0</strong>, not 1. The first element is <code>arr[0]</code>, the second is <code>arr[1]</code>, and for an array of size N, the last element is <code>arr[N-1]</code>. This trips people up for longer than you'd expect.",
                    code: `#include <stdio.h>

int main() {
    // Declare an array of 5 integers
    int scores[5] = {90, 85, 70, 95, 80};
    
    // Access items using [index]
    printf("First score: %d\\n", scores[0]); // Index 0
    printf("Third score: %d\\n", scores[2]); // Index 2
    
    // Modify an item
    scores[2] = 75; // Changed 70 to 75
    
    return 0;
}`,
                    output: "First score: 90\nThird score: 70"
                },
                {
                    title: "Looping Through Arrays",
                    content: "Loops and arrays are made for each other. The entire point of storing data in an array is so you can process all of it with a loop instead of writing out every element by hand. The standard pattern is a <code>for</code> loop starting at index 0 and stopping before the size. A useful trick: instead of hardcoding the size, compute it using <code>sizeof</code>. <code>sizeof(array)</code> gives the total bytes of the whole array; dividing by <code>sizeof(array[0])</code> gives the number of elements. This way, if you change the array size later, the loop automatically adjusts.",
                    code: `#include <stdio.h>

int main() {
    int nums[] = {10, 20, 30, 40, 50};
    
    // Calculate size: Total bytes / Bytes per item
    int size = sizeof(nums) / sizeof(nums[0]);
    
    printf("All values:\\n");
    for (int i = 0; i < size; i++) {
        printf("Index %d: Value %d\\n", i, nums[i]);
    }
    
    return 0;
}`,
                    output: "Index 0: Value 10\nIndex 1: Value 20\n..."
                },
                {
                    title: "Array Bounds",
                    warning: "C does <strong>NOT</strong> check array boundaries. At all. Ever. If you declare <code>int arr[5]</code> and then access <code>arr[10]</code>, C will not crash immediately, throw an error, or even give you a warning. It will just go to that memory address — which belongs to something else entirely — and read whatever bytes happen to be there. Sometimes you get garbage data. Sometimes you corrupt other variables. Sometimes, in the worst cases, this becomes an exploitable security vulnerability. Always make absolutely sure your loops stop at the correct boundary. Off-by-one errors (going one index too far) are one of the most common bugs in C."
                },
                {
                    title: "Passing Arrays to Functions",
                    content: "When you pass an array to a function, C does <strong>not</strong> copy the entire array. Instead, it passes a pointer to the first element — the array's memory address. This is called <strong>array decay</strong>. Two consequences fall out of this immediately.",
                    points: [
                        "<strong>The function CAN modify the original array</strong>: Because it received the actual memory address, not a copy. Any changes the function makes to elements are changes to the real array in the caller.",
                        "<strong>sizeof breaks inside the function</strong>: Once the array has decayed to a pointer, <code>sizeof(arr)</code> inside the function gives you the size of a pointer (typically 8 bytes on a 64-bit system) — not the size of the array. This is why functions that operate on arrays always take the size as a separate parameter."
                    ],
                    code: `#include <stdio.h>

// 'int arr[]' and 'int *arr' mean the same thing here.
// We MUST pass the size separately.
void printArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
}

void doubleAll(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        arr[i] *= 2; // Modifies the ORIGINAL array
    }
}

int main() {
    int nums[] = {1, 2, 3, 4, 5};
    int size = sizeof(nums) / sizeof(nums[0]); // sizeof works correctly HERE
    
    printf("Before: ");
    printArray(nums, size);
    
    doubleAll(nums, size);
    
    printf("After:  ");
    printArray(nums, size);
    
    return 0;
}`,
                    output: "Before: 1 2 3 4 5 \nAfter:  2 4 6 8 10 ",
                    tip: "Always compute <code>sizeof(arr) / sizeof(arr[0])</code> in the same scope where the array is declared, before passing it anywhere. Once it's passed to a function, that calculation will silently give you the wrong answer."
                }
            ]
        },
        {
            id: "strings",
            title: "Strings",
            explanation: "Here's something that surprises almost every newcomer to C: there is no string type. None. In C, a string is just an <strong>array of characters</strong> with a specific ending — a null terminator character <code>\\0</code> — that tells functions 'the string ends here'. Everything that feels basic in other languages (copying, comparing, appending strings) requires explicit function calls here.",
            sections: [
                {
                    title: "String Declaration",
                    content: "When you write a string literal in double quotes, C automatically adds the null terminator <code>\\0</code> at the end for you. So <code>\"Hello\"</code> is actually 6 characters, not 5: H, e, l, l, o, and then the invisible <code>\\0</code>. This matters enormously when allocating memory — always account for that extra byte, or you'll be one byte short and overwrite something important.",
                    code: `#include <stdio.h>

int main() {
    // Implicit size (compiler counts characters + 1 for \\0)
    char str1[] = "Hello";
    
    // This is actually: {'H', 'e', 'l', 'l', 'o', '\\0'}
    
    printf("%s\\n", str1);
    return 0;
}`,
                    output: "Hello"
                },
                {
                    title: "String Functions (string.h)",
                    content: "Since strings are just character arrays, you can't use regular operators on them. <code>str1 = str2</code> doesn't copy a string — it does something confusing with pointers. <code>str1 == str2</code> doesn't compare strings — it compares memory addresses. For actual string operations, you include <code>&lt;string.h&gt;</code> and use the library functions.",
                    code: `#include <stdio.h>
#include <string.h>

int main() {
    char src[] = "Hello";
    char dest[20]; // Destination must be big enough!
    
    // 1. Get length (excludes \\0)
    printf("Length: %lu\\n", strlen(src));
    
    // 2. Copy string
    strcpy(dest, src);
    printf("Copied: %s\\n", dest);
    
    // 3. Concatenate (append)
    strcat(dest, " World");
    printf("Combined: %s\\n", dest);
    
    // 4. Compare (returns 0 if equal)
    if (strcmp(src, "Hello") == 0) {
        printf("Strings match!\\n");
    }
    
    return 0;
}`,
                    output: "Length: 5\nCopied: Hello\nCombined: Hello World\nStrings match!"
                },
                {
                    title: "Character Classification with ctype.h",
                    content: "Often you need to inspect or manipulate individual characters in a string — check if a character is a digit, convert it to uppercase, skip whitespace. The <code>&lt;ctype.h&gt;</code> header provides a set of functions for exactly this. Every function takes an <code>int</code> (a character value) and returns non-zero for true, 0 for false. They're fast, portable, and save you from writing <code>if (c >= 'a' && c <= 'z')</code> repeatedly.",
                    points: [
                        "<code>isalpha(c)</code>: True if c is a letter (a–z or A–Z).",
                        "<code>isdigit(c)</code>: True if c is a decimal digit (0–9).",
                        "<code>isalnum(c)</code>: True if c is a letter or digit.",
                        "<code>isspace(c)</code>: True if c is whitespace: space, tab, newline, etc.",
                        "<code>isupper(c)</code> / <code>islower(c)</code>: True if c is uppercase/lowercase.",
                        "<code>toupper(c)</code> / <code>tolower(c)</code>: Convert case. Returns the converted character, or the original if no conversion applies. Does NOT modify in place — you must assign the result back."
                    ],
                    code: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

// Count digits in a string
int countDigits(const char *str) {
    int count = 0;
    while (*str) {
        if (isdigit(*str)) count++;
        str++;
    }
    return count;
}

// Convert string to uppercase in place
void toUpper(char *str) {
    while (*str) {
        *str = toupper(*str);
        str++;
    }
}

int main() {
    char text[] = "Hello, World! 123";
    
    printf("Original:  %s\\n", text);
    printf("Digits:    %d\\n", countDigits(text));
    
    toUpper(text);
    printf("Uppercase: %s\\n", text);
    
    // Testing individual characters
    char ch = 'A';
    printf("\\nisalpha('A') = %d\\n", isalpha(ch));  // non-zero (true)
    printf("isdigit('A') = %d\\n", isdigit(ch));  // 0 (false)
    printf("tolower('A') = %c\\n", tolower(ch));  // 'a'
    
    return 0;
}`,
                    output: "Original:  Hello, World! 123\nDigits:    3\nUppercase: HELLO, WORLD! 123\n\nisalpha('A') = 1\nisdigit('A') = 0\ntolower('A') = a"
                },
                {
                    title: "Reading Strings",
                    content: "Reading strings from the user has a major catch: <code>scanf</code> with <code>%s</code> stops reading at the first whitespace character. Type 'John Smith' and you'll only get 'John'. For reading a full line including spaces, use <code>fgets</code> instead. It reads everything up to a newline (or until the buffer is full, whichever comes first), making it both correct and safe.",
                    code: `#include <stdio.h>

int main() {
    char name[50];
    
    printf("Enter full name: ");
    // fgets reads spaces too!
    // stdin means "standard input" (keyboard)
    fgets(name, 50, stdin); 
    
    printf("Hello, %s", name);
    return 0;
}`,
                    output: "Enter full name: [John Doe]\nHello, John Doe"
                }
            ]
        },
        {
            id: "integer-types",
            title: "The Integer Type Family",
            explanation: "The curriculum so far has used <code>int</code> for almost everything. But C has an entire family of integer types of different sizes, with both signed and unsigned variants. Knowing which type to reach for affects the range of values you can store, the memory your program uses, and — importantly — the behavior of arithmetic at the boundaries. This is one of those topics that seems like a detail until it causes a real bug.",
            sections: [
                {
                    title: "Size Variants: short, int, long, long long",
                    content: "C's integer types form a size hierarchy. Each level guarantees it's at least as wide as the one before it. The exact sizes are platform-dependent — C only specifies minimums — but on all modern 64-bit systems you'll encounter, the sizes are consistent.",
                    points: [
                        "<code>short</code> (or <code>short int</code>): At least 16 bits. Typically 2 bytes. Range: -32,768 to 32,767. Useful for saving memory in large arrays where values are small.",
                        "<code>int</code>: At least 16 bits, in practice 32 bits (4 bytes) on all modern systems. Range: roughly -2.1 billion to +2.1 billion. This is the default integer type.",
                        "<code>long</code>: At least 32 bits. On 64-bit Linux/macOS it's 8 bytes; on 64-bit Windows it's still 4 bytes. This inconsistency is why <code>long</code> is unreliable for code that must be portable. Use <code>long long</code> or fixed-width types instead.",
                        "<code>long long</code>: At least 64 bits. Guaranteed to be 8 bytes everywhere. Range: roughly -9.2 quintillion to +9.2 quintillion. Use this when you need large integers and portability."
                    ],
                    code: `#include <stdio.h>

int main() {
    short  s = 32767;        // Max short
    int    i = 2147483647;   // Max int (2^31 - 1)
    long   l = 2147483647L;  // L suffix for long literal
    long long ll = 9223372036854775807LL; // Max long long
    
    printf("short:     %d  (%zu bytes)\\n", s,  sizeof(short));
    printf("int:       %d  (%zu bytes)\\n", i,  sizeof(int));
    printf("long:      %ld (%zu bytes)\\n", l,  sizeof(long));
    printf("long long: %lld (%zu bytes)\\n", ll, sizeof(long long));
    
    return 0;
}`,
                    output: "short:     32767  (2 bytes)\nint:       2147483647  (4 bytes)\nlong:      2147483647 (8 bytes)\nlong long: 9223372036854775807 (8 bytes)"
                },
                {
                    title: "Signed vs Unsigned",
                    content: "Every integer type has a signed variant (can hold negative values) and an unsigned variant (only zero and positive). Adding the <code>unsigned</code> keyword before a type shifts the range entirely into non-negative territory — you lose negative numbers but gain the same amount of positive range. The total number of representable values stays the same; it's just the position of the zero point that changes.",
                    points: [
                        "<code>unsigned int</code>: Range 0 to 4,294,967,295 (2^32 - 1). Exactly double the positive range of a signed int.",
                        "<code>unsigned short</code>: Range 0 to 65,535.",
                        "<code>unsigned long long</code>: Range 0 to 18,446,744,073,709,551,615. Use when you need a counter that absolutely cannot go negative and needs a huge range.",
                        "<strong>When to use unsigned</strong>: Array indices, sizes, bit masks, counters that should never be negative. The standard library uses <code>size_t</code> (which is an unsigned type) for sizes and counts for exactly this reason.",
                        "<strong>The danger</strong>: Subtracting from an unsigned variable when the result would be negative wraps around to a huge positive number. <code>0U - 1</code> is 4,294,967,295, not -1. This has caused real security bugs."
                    ],
                    code: `#include <stdio.h>

int main() {
    unsigned int u = 0;
    
    // Unsigned subtraction wrapping
    u = u - 1; // Wraps to maximum value!
    printf("0U - 1 = %u\\n", u); // 4294967295
    
    // Signed overflow (undefined behavior)
    int s = 2147483647; // INT_MAX
    s = s + 1;          // Undefined behavior! Usually wraps to INT_MIN
    printf("INT_MAX + 1 = %d\\n", s); // -2147483648 (but UB!)
    
    // Format specifiers
    unsigned int x = 4000000000U; // Too big for int!
    printf("unsigned: %u\\n",  x); // correct: use %u
    printf("signed:   %d\\n",  x); // wrong:   prints garbage
    
    return 0;
}`,
                    output: "0U - 1 = 4294967295\nINT_MAX + 1 = -2147483648\nunsigned: 4000000000\nsigned:   -294967296",
                    warning: "Never mix signed and unsigned types in comparisons. If you compare a signed <code>int</code> to an <code>unsigned int</code>, C converts the signed value to unsigned first — meaning -1 compares as greater than 4000000000. This is one of the most common sources of subtle bugs in C. Always use consistent signedness, or cast explicitly when you must mix."
                },
                {
                    title: "Format Specifiers for Integer Types",
                    content: "Different integer types need different format specifiers. Using the wrong one is technically undefined behavior and will print garbage on some platforms. The rule is: add <code>l</code> for <code>long</code>, <code>ll</code> for <code>long long</code>, and <code>u</code> for unsigned.",
                    points: [
                        "<code>%d</code> or <code>%i</code>: signed <code>int</code>",
                        "<code>%u</code>: unsigned <code>int</code>",
                        "<code>%ld</code>: signed <code>long</code>",
                        "<code>%lu</code>: unsigned <code>long</code>",
                        "<code>%lld</code>: signed <code>long long</code>",
                        "<code>%llu</code>: unsigned <code>long long</code>",
                        "<code>%hd</code>: signed <code>short</code> (rarely needed — shorts are promoted to int in expressions)",
                        "<code>%zu</code>: <code>size_t</code> — use this for <code>sizeof</code> results and array sizes"
                    ],
                    code: `#include <stdio.h>

int main() {
    short          sh  = 1000;
    int            i   = 2000000;
    long           l   = 3000000000L;
    long long      ll  = 9000000000LL;
    unsigned int   ui  = 4000000000U;
    unsigned long long ull = 18000000000ULL;
    
    printf("short:     %hd\\n", sh);
    printf("int:       %d\\n",  i);
    printf("long:      %ld\\n", l);
    printf("long long: %lld\\n", ll);
    printf("uint:      %u\\n",  ui);
    printf("ull:       %llu\\n", ull);
    printf("sizeof(int): %zu\\n", sizeof(int));
    
    return 0;
}`,
                    output: "short:     1000\nint:       2000000\nlong:      3000000000\nlong long: 9000000000\nuint:      4000000000\null:       18000000000\nsizeof(int): 4"
                }
            ]
        },
        {
            id: "random",
            title: "Random Numbers",
            explanation: "Generating random numbers is one of the first things most programmers want to do — games, simulations, shuffling, sampling. C provides basic random number generation through <code>&lt;stdlib.h&gt;</code>. The mechanism is simple: a pseudo-random number generator (PRNG) that produces a long sequence of numbers that appear random but are completely deterministic given the same starting point (the seed).",
            sections: [
                {
                    title: "rand() and srand()",
                    content: "<code>rand()</code> returns a pseudo-random integer between 0 and <code>RAND_MAX</code> (at least 32767, usually 2^31-1). The key word is pseudo-random: the numbers follow a fixed mathematical sequence. If you start from the same seed, you always get the same sequence — useful for testing, but useless for games if the program always plays the same way. <code>srand(seed)</code> sets the starting point of the sequence.",
                    points: [
                        "<strong><code>rand()</code></strong>: Returns a random int in the range [0, RAND_MAX]. Without seeding, always returns the same sequence starting from a default seed.",
                        "<strong><code>srand(seed)</code></strong>: Seeds the random number generator. Call this once at the start of your program — before any calls to <code>rand()</code>. Calling it multiple times is not useful.",
                        "<strong>Seeding with time</strong>: The standard trick is <code>srand(time(NULL))</code>. <code>time(NULL)</code> returns the current Unix timestamp (seconds since January 1, 1970) — which is different every time you run the program, giving you a different sequence each run. Include <code>&lt;time.h&gt;</code> for <code>time()</code>.",
                        "<strong>Scaling the range</strong>: To get a random number in the range [0, N-1], use <code>rand() % N</code>. To get [min, max], use <code>min + rand() % (max - min + 1)</code>. Be aware that the modulo method has slight bias for large N, but it's fine for most applications."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    // Seed with current time - different every run
    srand(time(NULL));
    
    // Generate 5 random numbers between 1 and 10
    printf("5 random numbers (1-10):\\n");
    for (int i = 0; i < 5; i++) {
        int r = 1 + rand() % 10; // Range: [1, 10]
        printf("%d ", r);
    }
    printf("\\n");
    
    // Simulate a coin flip: 0 = heads, 1 = tails
    printf("\\nFlipping 10 coins:\\n");
    for (int i = 0; i < 10; i++) {
        if (rand() % 2 == 0) {
            printf("H ");
        } else {
            printf("T ");
        }
    }
    printf("\\n");
    
    // Roll a six-sided die
    printf("\\nRolling a die 5 times:\\n");
    for (int i = 0; i < 5; i++) {
        printf("%d ", 1 + rand() % 6);
    }
    printf("\\n");
    
    return 0;
}`,
                    output: "5 random numbers (1-10):\n7 2 9 4 1 \n\nFlipping 10 coins:\nH T T H H T H T T H \n\nRolling a die 5 times:\n3 6 1 4 2 ",
                    warning: "<code>rand()</code> is not suitable for security or cryptography. It's a simple linear congruential generator — its output is predictable if you know the seed, and its statistical properties are mediocre. For anything security-related (generating passwords, encryption keys, tokens), use your platform's cryptographically secure random source: <code>/dev/urandom</code> on Linux/macOS, or <code>BCryptGenRandom</code> on Windows."
                },
                {
                    title: "Deterministic Seeding for Testing",
                    content: "The fact that <code>rand()</code> is deterministic is actually useful for testing and debugging. If you seed with a fixed value instead of <code>time(NULL)</code>, your program produces the exact same 'random' sequence every run — which means you can reproduce bugs that involve random numbers, and you can write tests with predictable expected outputs.",
                    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Fixed seed: same output EVERY run
    srand(42);
    
    printf("With seed 42:\\n");
    for (int i = 0; i < 5; i++) {
        printf("%d ", rand() % 100);
    }
    printf("\\n");
    
    // Reset to same seed - get same sequence again
    srand(42);
    printf("Same seed again:\\n");
    for (int i = 0; i < 5; i++) {
        printf("%d ", rand() % 100);
    }
    printf("\\n");
    
    return 0;
}`,
                    output: "With seed 42:\n68 49 9 24 85 \nSame seed again:\n68 49 9 24 85 ",
                    tip: "A common pattern: accept an optional seed from the command line or an environment variable. If the seed is provided, use it (for reproducible testing). If not, seed with <code>time(NULL)</code> (for production). This gives you the best of both worlds."
                }
            ]
        }
    ],
    
    quiz: [
        {
            question: "Which loop runs at least once?",
            options: ["for", "while", "do-while", "foreach"],
            answer: 2,
            explanation: "do-while checks its condition after executing the body, so it always runs at least once. while and for check first."
        },
        {
            question: "What does `break` do?",
            options: ["Pauses the loop", "Skips iteration", "Exits the loop", "Breaks the compiler"],
            answer: 2,
            explanation: "break immediately exits the innermost loop or switch statement. continue skips to the next iteration; break exits entirely."
        },
        {
            question: "What is the index of the last element in array `arr[10]`?",
            options: ["10", "9", "0", "11"],
            answer: 1,
            explanation: "Array indices start at 0, so for arr[10] the valid indices are 0 through 9. Index 9 is the last element."
        },
        {
            question: "What ends a C string?",
            options: ["Space", "Period", "Null Terminator (\\0)", "Newline"],
            answer: 2,
            explanation: "C strings end with a null terminator '\\0' (value 0). Functions like strlen count characters until they find this byte."
        },
        {
            question: "How are arguments passed to functions in C?",
            options: ["By Reference", "By Value (Copy)", "By Pointer", "By Name"],
            answer: 1,
            explanation: "C passes all function arguments by value — a copy is made. To modify the original, you must pass a pointer."
        },
        {
            question: "Which function copies a string?",
            options: ["strcat", "strcmp", "strcpy", "strlen"],
            answer: 2,
            explanation: "strcpy copies a string into a destination buffer. strcat appends. strcmp compares. strlen measures."
        },
        {
            question: "What is the output of: for(int i=0; i<3; i++) printf(\"*\");",
            options: ["***", "****", "**", "Error"],
            answer: 0,
            explanation: "The loop runs for i=0,1,2, printing '0\\n1\\n2\\n'. The condition i<3 means it stops before i=3."
        },
        {
            question: "If you access array index out of bounds, what happens?",
            options: ["Compiler Error", "Runtime Error", "Undefined Behavior", "Returns 0"],
            answer: 2,
            explanation: "Out-of-bounds array access is undefined behavior — anything can happen. The program may crash, silently corrupt data, or appear to work. C does not perform bounds checking."
        },
        {
            question: "What does isdigit('5') return?",
            options: ["0", "5", "Non-zero (true)", "'5'"],
            answer: 2,
            explanation: "isdigit returns non-zero (true) for characters '0' through '9', and 0 for anything else. It tests the ASCII value of the character."
        },
        {
            question: "What function must you call before rand() to get different results each run?",
            options: ["seed()", "srand(time(NULL))", "init_rand()", "randomize()"],
            answer: 1,
            explanation: "srand seeds the random number generator. Without seeding with time(NULL), rand() produces the same sequence every run because it starts with the same default seed."
        },
        {
            question: "Which type holds the largest integer values?",
            options: ["int", "long", "long long", "short"],
            answer: 2,
            explanation: "long long is 64 bits and holds values up to ~9.2 × 10^18. unsigned long long is even larger. int is only 32 bits."
        }
    ],
    
    practice: [
        {
            title: "Sum of Array",
            difficulty: "easy",
            problem: "Create an array of 5 integers. Use a loop to calculate the sum of all elements.",
            solution: `#include <stdio.h>

int main() {
    int arr[] = {5, 10, 15, 20, 25};
    int sum = 0;
    int size = sizeof(arr) / sizeof(arr[0]);
    
    for(int i=0; i<size; i++) {
        sum += arr[i];
    }
    printf("Sum: %d\\n", sum);
    return 0;
}`
        },
        {
            title: "Factorial Function",
            difficulty: "medium",
            problem: "Write a function `factorial(int n)` that returns n! (e.g., 5! = 5*4*3*2*1). Use long long as the return type to avoid overflow.",
            solution: `#include <stdio.h>

long long factorial(int n) {
    long long result = 1;
    for(int i=1; i<=n; i++) {
        result *= i;
    }
    return result;
}

int main() {
    printf("5! = %lld\\n", factorial(5));
    printf("20! = %lld\\n", factorial(20));
    return 0;
}`
        },
        {
            title: "String Length Manual",
            difficulty: "medium",
            problem: "Write a program that counts the length of a string WITHOUT using strlen().",
            solution: `#include <stdio.h>

int main() {
    char str[] = "Hello World";
    int count = 0;
    
    while (str[count] != '\\0') {
        count++;
    }
    
    printf("Length: %d\\n", count);
    return 0;
}`
        },
        {
            title: "Multiplication Table",
            difficulty: "hard",
            problem: "Use nested loops to print a 5x5 multiplication table.",
            solution: `#include <stdio.h>

int main() {
    for(int i=1; i<=5; i++) {
        for(int j=1; j<=5; j++) {
            printf("%4d", i*j);
        }
        printf("\\n");
    }
    return 0;
}`
        },
        {
            title: "Password Validator",
            difficulty: "hard",
            problem: "Write a function that checks if a password string is valid: at least 8 characters, contains at least one uppercase letter, one lowercase letter, and one digit. Use <ctype.h> functions.",
            hint: "Loop through each character checking isdigit(), isupper(), islower(). Use bool flags.",
            solution: `#include <stdio.h>
#include <stdbool.h>
#include <ctype.h>
#include <string.h>

bool isValidPassword(const char *password) {
    int len = strlen(password);
    if (len < 8) return false;
    
    bool hasUpper = false, hasLower = false, hasDigit = false;
    
    for (int i = 0; i < len; i++) {
        if (isupper(password[i])) hasUpper = true;
        if (islower(password[i])) hasLower = true;
        if (isdigit(password[i])) hasDigit = true;
    }
    
    return hasUpper && hasLower && hasDigit;
}

int main() {
    const char *tests[] = {"weak", "NoDigits!", "n0upper!", "Str0ng!"};
    for (int i = 0; i < 4; i++) {
        printf("'%s': %s\\n", tests[i],
               isValidPassword(tests[i]) ? "VALID" : "INVALID");
    }
    return 0;
}`
        }
    ],
    
    exam: [
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    for (int i = 0; i < 4; i++) {
        printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
            options: ["0 1 2 3 4", "0 1 2 3", "1 2 3 4", "0 1 2"],
            answer: 1,
            explanation: "The loop runs while i < 4, so i takes values 0, 1, 2, 3. When i reaches 4, the condition fails and the loop exits. Four numbers printed."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int i = 0;
    while (i < 5) {
        if (i == 3) break;
        printf("%d ", i);
        i++;
    }
    printf("\\n");
    return 0;
}`,
            options: ["0 1 2 3 4", "0 1 2 3", "0 1 2", "1 2 3"],
            answer: 2,
            explanation: "When i reaches 3, break exits the loop immediately without printing 3. Only 0, 1, 2 are printed."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int square(int n) {
    return n * n;
}
int main(void) {
    printf("%d\\n", square(4));
    printf("%d\\n", square(3) + square(4));
    return 0;
}`,
            options: ["16 then 25", "16 then 7", "4 then 7", "16 then 24"],
            answer: 0,
            explanation: "square(4) = 16. square(3) + square(4) = 9 + 16 = 25. Functions are evaluated before their results are used in expressions."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int arr[] = {10, 20, 30, 40, 50};
    printf("%d\\n", arr[2]);
    printf("%d\\n", arr[0] + arr[4]);
    return 0;
}`,
            options: ["30 then 60", "20 then 50", "30 then 50", "20 then 60"],
            answer: 0,
            explanation: "arr[2] is the third element: 30. arr[0] + arr[4] = 10 + 50 = 60."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <string.h>
int main(void) {
    char s[] = "Hello";
    printf("%zu\\n", strlen(s));
    printf("%zu\\n", sizeof(s));
    return 0;
}`,
            options: ["5 then 5", "5 then 6", "6 then 6", "5 then 4"],
            answer: 1,
            explanation: "strlen counts characters excluding the null terminator: 5. sizeof includes the null terminator: 6. This is a key distinction."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
void addOne(int x) {
    x = x + 1;
}
int main(void) {
    int n = 5;
    addOne(n);
    printf("%d\\n", n);
    return 0;
}`,
            options: ["6", "5", "0", "Undefined"],
            answer: 1,
            explanation: "C passes arguments by value — addOne receives a copy of n. Modifying x inside the function does not affect n in main. n stays 5."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    for (int i = 0; i < 5; i++) {
        if (i % 2 == 0) continue;
        printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
            options: ["0 2 4", "1 3", "0 1 2 3 4", "1 2 3 4"],
            answer: 1,
            explanation: "continue skips the rest of the loop body when i is even. Only odd values (1, 3) reach printf."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        sum += i;
    }
    printf("%d\\n", sum);
    return 0;
}`,
            options: ["10", "15", "14", "5"],
            answer: 1,
            explanation: "Adds 1+2+3+4+5 = 15. The loop runs for i = 1, 2, 3, 4, 5 (inclusive because i <= 5)."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <string.h>
int main(void) {
    char a[] = "cat";
    char b[] = "dog";
    printf("%d\\n", strcmp(a, b));
    printf("%d\\n", strcmp(a, a));
    return 0;
}`,
            options: ["0 then 0", "negative then 0", "positive then 0", "negative then 1"],
            answer: 1,
            explanation: "strcmp compares lexicographically. 'c' < 'd' so strcmp(\"cat\", \"dog\") is negative. Comparing equal strings returns 0."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int x = 10;
    do {
        printf("%d ", x);
        x -= 3;
    } while (x > 0);
    printf("\\n");
    return 0;
}`,
            options: ["10 7 4 1", "10 7 4", "7 4 1", "10 7 4 1 -2"],
            answer: 0,
            explanation: "do-while executes before checking the condition. Starts at 10: prints 10 (x=7), 7 (x=4), 4 (x=1), 1 (x=-2). Now x > 0 is false, loop ends."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int arr[3] = {0};
    arr[1] = 42;
    for (int i = 0; i < 3; i++) {
        printf("%d ", arr[i]);
    }
    return 0;
}`,
            options: ["0 0 0", "42 0 0", "0 42 0", "42 42 42"],
            answer: 2,
            explanation: "int arr[3] = {0} initializes all elements to zero. Then arr[1] is set to 42. Loop prints each: 0, 42, 0."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
int main(void) {
    printf("%d\\n", factorial(5));
    return 0;
}`,
            options: ["120", "24", "60", "5"],
            answer: 0,
            explanation: "5! = 5*4*3*2*1 = 120. The recursion unwinds: factorial(5) = 5*factorial(4) = 5*24 = 120."
        }
    ]
};

window.ModuleEarlyIntermediate = ModuleEarlyIntermediate;