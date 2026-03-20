const ModuleAdvanced = {
    description: "Structures, File I/O, Preprocessors, and C23 attributes: [[nodiscard]], [[deprecated]], [[fallthrough]], [[maybe_unused]], and #embed. Organizing complex data, persisting it, and controlling what the compiler sees.",
    
    lessons: [
        {
            id: "structs",
            title: "Structures (Grouping Data)",
            explanation: "Arrays let you store many values of the same type. But real-world data doesn't cooperate with that constraint. A person has a name (string), an age (integer), and a height (float) — three different types that naturally belong together. You could manage them as three separate variables, but that falls apart the moment you have ten people: thirty variables with no clear relationship between them. A <strong>struct</strong> solves this by letting you bundle different types into a single, named unit. It's the first step toward thinking in terms of data structures rather than individual variables.",
            sections: [
                {
                    title: "Concept: The Blueprint",
                    content: "Defining a struct doesn't create any data or allocate any memory — it just tells the compiler what the layout looks like. Think of it as a blueprint. The blueprint for a house describes how many rooms it has and where they are, but the blueprint itself isn't a house. You build actual houses (variables) from it. Each house built from the same blueprint has the same layout, but holds its own independent contents.",
                    code: `#include <stdio.h>
#include <string.h>

struct Student {
    char name[50];
    int age;
    float gpa;
};

int main() {
    struct Student student1;
    
    strcpy(student1.name, "Alice");
    student1.age = 20;
    student1.gpa = 3.8;
    
    printf("Student Name: %s\\n", student1.name);
    printf("Student Age: %d\\n", student1.age);
    printf("Student GPA: %.2f\\n", student1.gpa);
    
    return 0;
}`,
                    output: "Student Name: Alice\nStudent Age: 20\nStudent GPA: 3.80"
                },
                {
                    title: "Designated Initializers",
                    content: "C99 introduced designated initializers — a cleaner syntax for initializing structs where you name each field explicitly. Instead of relying on order (and having to count which position corresponds to which field), you write <code>.fieldname = value</code>. This makes initialization self-documenting and immune to bugs caused by adding or reordering fields later.",
                    points: [
                        "<strong>Syntax</strong>: <code>struct Student s = {.name = \"Alice\", .age = 20, .gpa = 3.8};</code>",
                        "<strong>Order doesn't matter</strong>: With designated initializers, you can specify fields in any order. Unspecified fields are zero-initialized.",
                        "<strong>Partial initialization</strong>: You can initialize only some fields — the rest default to zero/NULL.",
                        "<strong>Works for arrays too</strong>: <code>int arr[5] = {[2] = 10, [4] = 20};</code> sets indices 2 and 4 explicitly, leaving the rest as zero."
                    ],
                    code: `#include <stdio.h>

typedef struct {
    char name[50];
    int age;
    float gpa;
} Student;

int main() {
    // Old way: order-dependent, fragile
    Student s1 = {"Bob", 21, 3.5};
    
    // Designated initializers: clear and order-independent
    Student s2 = {
        .name = "Alice",
        .gpa  = 3.8,   // Order doesn't matter
        .age  = 20
    };
    
    // Partial init: unspecified fields are zero
    Student s3 = {.name = "Charlie"}; // age=0, gpa=0.0
    
    printf("%s: age=%d, gpa=%.1f\\n", s1.name, s1.age, s1.gpa);
    printf("%s: age=%d, gpa=%.1f\\n", s2.name, s2.age, s2.gpa);
    printf("%s: age=%d, gpa=%.1f\\n", s3.name, s3.age, s3.gpa);
    
    return 0;
}`,
                    output: "Bob: age=21, gpa=3.5\nAlice: age=20, gpa=3.8\nCharlie: age=0, gpa=0.0"
                },
                {
                    title: "The Dot Operator (.)",
                    content: "The dot operator is how you reach inside a struct variable and access a specific member. <code>student1.age</code> means exactly what it looks like: 'the age field belonging to student1'. You can read it, write to it, pass it to functions, take its address — everything you'd do with a normal variable. The members of different struct variables are completely independent: <code>student1.age</code> and <code>student2.age</code> occupy different bytes in memory and have nothing to do with each other."
                },
                {
                    title: "Copying and Comparing Structs",
                    content: "Structs behave differently from arrays when used with the assignment operator and comparison operators. Arrays cannot be directly assigned or compared — you must loop or use functions. Structs, on the other hand, can be directly assigned with <code>=</code>, which performs a complete shallow copy of all members.",
                    points: [
                        "<strong>Assignment copies</strong>: <code>s2 = s1</code> copies all fields from <code>s1</code> into <code>s2</code>. After this, they are independent — modifying <code>s2</code> does not affect <code>s1</code>. This is a <em>shallow</em> copy — if a field is a pointer, the pointer value is copied, not the data it points to.",
                        "<strong>Can be passed to and returned from functions</strong>: C copies the entire struct on function call and return. For large structs this can be slow — passing a pointer instead is common for performance.",
                        "<strong>== does NOT work on structs</strong>: You cannot compare two structs with <code>s1 == s2</code>. The compiler will reject it. To compare structs, you must compare their fields individually, or use <code>memcmp()</code> (with caution — padding bytes may differ even when fields are equal)."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

typedef struct {
    int x;
    int y;
} Point;

int pointsEqual(Point a, Point b) {
    return a.x == b.x && a.y == b.y;
}

int main() {
    Point p1 = {.x = 3, .y = 4};
    
    // Direct assignment: full copy
    Point p2 = p1;
    
    printf("p1: (%d, %d)\\n", p1.x, p1.y);
    printf("p2: (%d, %d)\\n", p2.x, p2.y);
    
    p2.x = 99; // Modifying p2 does NOT affect p1
    printf("After p2.x = 99:\\n");
    printf("p1.x = %d\\n", p1.x); // Still 3
    printf("p2.x = %d\\n", p2.x); // 99
    
    // Comparison: must compare field by field
    Point p3 = {.x = 3, .y = 4};
    printf("p1 == p3: %d\\n", pointsEqual(p1, p3)); // 1 (true)
    // p1 == p3;  // ERROR: can't use == on structs
    
    return 0;
}`,
                    output: "p1: (3, 4)\np2: (3, 4)\nAfter p2.x = 99:\np1.x = 3\np2.x = 99\np1 == p3: 1",
                    warning: "The shallow copy behavior of struct assignment is a common source of bugs. If your struct contains a <code>char*</code> pointer (not a char array), the assignment copies the pointer — both structs now point to the same string. Modifying or freeing the string through one struct affects the other. When structs contain pointers to heap memory, you need a custom deep-copy function."
                },
                {
                    title: "Structures and Pointers",
                    content: "When you have a pointer to a struct rather than the struct itself, you can't use the dot operator directly — you'd need to dereference the pointer first and then access the member: <code>(*ptr).age</code>. The parentheses are mandatory because the dot operator has higher precedence than <code>*</code>. This is clunky enough that C provides a shorthand: the arrow operator <code>-></code>, which combines the dereference and the member access into a single clean step.",
                    code: `#include <stdio.h>
#include <string.h>

typedef struct {
    char name[20];
    int age;
} Student;

int main() {
    Student s1;
    Student *ptr = &s1;
    
    ptr->age = 20;
    strcpy(ptr->name, "Alice");
    
    printf("Age: %d\\n", s1.age);
    printf("Age via pointer: %d\\n", ptr->age);
    
    return 0;
}`,
                    output: "Age: 20\nAge via pointer: 20",
                    tip: "The rule is simple and worth memorizing: if you have the actual struct variable, use dot (<code>.</code>). If you have a pointer to a struct, use arrow (<code>-></code>). You will make this choice hundreds of times in any non-trivial C program."
                },
                {
                    title: "Self-Referential Structs (Linked Lists)",
                    content: "A struct can contain a pointer to another struct of the same type. This is how you build linked data structures — lists, trees, graphs — where each node holds data and a pointer to the next node. You can't have a struct that directly contains itself (infinite size), but a pointer to itself is fine since pointers always have the same size regardless of what they point to.",
                    code: `#include <stdio.h>
#include <stdlib.h>

// A linked list node: holds a value and a pointer to the next node
struct Node {
    int value;
    struct Node *next; // Pointer to another Node of the same type
};

// Build a linked list from an array
struct Node *createList(int *arr, int size) {
    struct Node *head = NULL;
    struct Node *tail = NULL;
    
    for (int i = 0; i < size; i++) {
        struct Node *new = (struct Node*)malloc(sizeof(struct Node));
        new->value = arr[i];
        new->next  = NULL;
        
        if (head == NULL) {
            head = new;
            tail = new;
        } else {
            tail->next = new;
            tail = new;
        }
    }
    return head;
}

// Print and free the list
void printAndFree(struct Node *head) {
    struct Node *curr = head;
    while (curr != NULL) {
        printf("%d ", curr->value);
        struct Node *next = curr->next;
        free(curr);
        curr = next;
    }
    printf("\\n");
}

int main() {
    int data[] = {10, 20, 30, 40, 50};
    struct Node *list = createList(data, 5);
    printAndFree(list);
    return 0;
}`,
                    output: "10 20 30 40 50 ",
                    tip: "Notice that inside the struct definition, we use <code>struct Node *next</code> — not <code>Node *next</code>. This is because the <code>typedef</code> alias isn't available yet when the struct body is being defined. To use <code>Node *next</code> directly, you can give the struct a tag name: <code>typedef struct Node { int value; struct Node *next; } Node;</code> — the tag (<code>struct Node</code>) is available immediately, even inside its own definition."
                }
            ]
        },
        {
            id: "unions-enums",
            title: "Unions and Enums",
            explanation: "Two specialized data types that solve very specific problems. Unions are a memory-saving technique for situations where you know you'll only ever need one of several possible types at a time. Enums are a readability tool for replacing magic numbers with human-readable names.",
            sections: [
                {
                    title: "Unions: Shared Space",
                    content: "A union looks like a struct — same syntax, same member declarations — but with one fundamental difference: all members share the same block of memory. A struct allocates separate space for each member. A union allocates space for only the largest member, and all members overlap in that same space. At any given moment, only the last value written is valid.",
                    points: [
                        "<strong>Size of Union</strong>: Equal to the size of its largest member, not the sum. A union with an <code>int</code> (4 bytes) and a <code>double</code> (8 bytes) is 8 bytes total — not 12.",
                        "<strong>Behavior</strong>: Writing to one member reinterprets the shared bytes for all other members. The bytes don't disappear — they're just interpreted as a different type, which produces garbage unless you know exactly what you're doing."
                    ],
                    code: `#include <stdio.h>

union Data {
    int i;
    float f;
    char c;
};

int main() {
    union Data d;
    
    d.i = 10;
    printf("Integer: %d\\n", d.i);
    
    d.f = 3.14; // This overwrites the integer bits!
    printf("Float: %.2f\\n", d.f);
    printf("Integer now: %d (Garbage!)\\n", d.i);
    
    return 0;
}`,
                    output: "Integer: 10\nFloat: 3.14\nInteger now: 1078523331 (Garbage!)"
                },
                {
                    title: "Enums: Named Numbers",
                    content: "An enumeration assigns human-readable names to a sequence of integer constants. Under the hood it's just integers — the compiler assigns 0 to the first name, 1 to the second, and so on, unless you override the values manually. <code>if (today == WED)</code> is immediately understandable. <code>if (today == 3)</code> requires looking up what 3 means.",
                    code: `#include <stdio.h>

enum Weekday { SUN, MON, TUE, WED, THU, FRI, SAT };

int main() {
    enum Weekday today = WED;
    
    printf("Day number: %d\\n", today); // WED is 3
    
    if (today == WED) {
        printf("It is Wednesday!\\n");
    }
    
    return 0;
}`,
                    output: "Day number: 3\nIt is Wednesday!"
                }
            ]
        },
        {
            id: "typedef",
            title: "Typedef (Renaming Types)",
            explanation: "<code>typedef</code> creates an alias — a new name for an existing type. The underlying type doesn't change at all; you're just giving it a shorter or more descriptive label. It produces no code at runtime and has zero performance implications. It's purely a convenience and clarity tool.",
            sections: [
                {
                    title: "Basic Syntax",
                    content: "The syntax is <code>typedef existing_type new_name;</code>. After that declaration, <code>new_name</code> can be used anywhere the original type would be used. They are interchangeable from the compiler's perspective.",
                    code: `#include <stdio.h>

typedef unsigned char byte;
typedef char* STRING;

int main() {
    byte b = 255;
    STRING name = "John";
    
    printf("Byte: %d\\n", b);
    printf("Name: %s\\n", name);
    
    return 0;
}`,
                    output: "Byte: 255\nName: John"
                },
                {
                    title: "Typedef with Structs",
                    content: "This is by far the most common use of <code>typedef</code> in real C code. Without it, every time you declare a struct variable you have to write the full <code>struct StructName varName</code> — the <code>struct</code> keyword is mandatory in plain C. With <code>typedef</code>, you give the struct type a single name and use that instead.",
                    code: `#include <stdio.h>

typedef struct {
    int x;
    int y;
} Point;

int main() {
    Point p1 = {.x = 10, .y = 5};
    printf("Point coordinates: %d, %d\\n", p1.x, p1.y);
    return 0;
}`
                }
            ]
        },
        {
            id: "file-io",
            title: "File Input/Output",
            explanation: "Every program we've written so far lives entirely in RAM. The moment it exits, everything is gone. File I/O is how programs create data that outlasts their own execution. You write to a file; it goes to disk; it's still there tomorrow, after a reboot, on another machine.",
            sections: [
                {
                    title: "The File Pointer",
                    content: "In C, every open file is represented by a <code>FILE*</code> — a pointer to a struct managed by the C standard library that tracks the file's current state. The workflow is always the same three steps — and skipping the third one is one of the most common file I/O bugs.",
                    points: [
                        "1. <strong>Open</strong>: Call <code>fopen</code> to get a <code>FILE*</code>. Always check that the returned pointer is not NULL.",
                        "2. <strong>Read or Write</strong>: Use <code>fprintf</code>, <code>fgets</code>, <code>fscanf</code>, <code>fread</code>, <code>fwrite</code>, or other file functions.",
                        "3. <strong>Close</strong>: Call <code>fclose</code> when done. This flushes any buffered writes to disk. If you skip this, writes may be silently lost."
                    ]
                },
                {
                    title: "Writing to a File (w mode)",
                    content: "Mode <code>\"w\"</code> opens a file for writing. If the file doesn't exist, it's created. If it does exist, it is immediately truncated to zero bytes — all previous content is gone before you write a single character. For appending to an existing file without destroying its contents, use mode <code>\"a\"</code> instead.",
                    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *fptr;
    
    fptr = fopen("diary.txt", "w");
    
    if (fptr == NULL) {
        perror("fopen");
        return 1;
    }
    
    fprintf(fptr, "Today I learned C.\\n");
    fprintf(fptr, "It was fun!\\n");
    
    fclose(fptr);
    
    printf("File written successfully.\\n");
    return 0;
}`,
                    output: "File written successfully.",
                    tip: "The output on screen is just the success message. The actual content went into 'diary.txt' in the same directory as your executable."
                },
                {
                    title: "Reading from a File (r mode)",
                    content: "Mode <code>\"r\"</code> opens an existing file for reading. If the file doesn't exist, <code>fopen</code> returns NULL — unlike write mode, it won't create the file for you. The standard pattern for reading line by line uses <code>fgets</code> in a loop.",
                    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *fptr;
    char buffer[255];
    
    fptr = fopen("diary.txt", "r");
    
    if (fptr == NULL) {
        perror("fopen");
        return 1;
    }
    
    while (fgets(buffer, 255, fptr) != NULL) {
        printf("%s", buffer);
    }
    
    fclose(fptr);
    return 0;
}`,
                    output: "Reading file contents:\nToday I learned C.\nIt was fun!"
                },
                {
                    title: "Binary File I/O (fread / fwrite)",
                    content: "Text mode reads and writes human-readable characters — newlines may be translated, and special bytes may be interpreted. Binary mode treats the file as a raw sequence of bytes — no translation, no interpretation. This is what you need for reading and writing non-text data: images, audio, struct records, compiled data. Open in binary mode by appending <code>b</code> to the mode string: <code>\"rb\"</code>, <code>\"wb\"</code>, <code>\"ab\"</code>.",
                    points: [
                        "<code>fwrite(ptr, size, count, stream)</code>: Writes <code>count</code> elements of <code>size</code> bytes each from the memory at <code>ptr</code> to the file. Returns the number of elements successfully written.",
                        "<code>fread(ptr, size, count, stream)</code>: Reads <code>count</code> elements of <code>size</code> bytes each from the file into the memory at <code>ptr</code>. Returns the number of elements successfully read. A return value less than <code>count</code> means end of file or an error — check with <code>feof()</code> or <code>ferror()</code>.",
                        "<strong>Writing structs directly</strong>: <code>fwrite(&mystruct, sizeof(mystruct), 1, fptr)</code> writes the raw bytes of the struct to the file. You can read it back with <code>fread</code>. This is fast and simple, but the file format is platform-specific — padding bytes, endianness, and field sizes may differ between machines."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    float score;
    char name[20];
} Record;

int main() {
    // Write binary data
    FILE *out = fopen("records.bin", "wb");
    if (!out) { perror("fopen"); return 1; }
    
    Record records[] = {
        {1, 95.5f, "Alice"},
        {2, 87.3f, "Bob"},
        {3, 91.0f, "Charlie"}
    };
    
    int n = sizeof(records) / sizeof(records[0]);
    size_t written = fwrite(records, sizeof(Record), n, out);
    printf("Wrote %zu records\\n", written);
    fclose(out);
    
    // Read binary data back
    FILE *in = fopen("records.bin", "rb");
    if (!in) { perror("fopen"); return 1; }
    
    Record r;
    printf("\\nRecords from file:\\n");
    while (fread(&r, sizeof(Record), 1, in) == 1) {
        printf("ID:%d  Score:%.1f  Name:%s\\n", r.id, r.score, r.name);
    }
    fclose(in);
    
    return 0;
}`,
                    output: "Wrote 3 records\n\nRecords from file:\nID:1  Score:95.5  Name:Alice\nID:2  Score:87.3  Name:Bob\nID:3  Score:91.0  Name:Charlie"
                },
                {
                    title: "Random File Access (fseek / ftell / rewind)",
                    content: "Sequential reading with <code>fgets</code> or <code>fread</code> is fine when you want to process a file from start to finish. But sometimes you need to jump to a specific position — read a record in the middle of a file, go back and re-read something. Every open file has an internal position indicator — a cursor that tracks where the next read or write will happen.",
                    points: [
                        "<code>fseek(fptr, offset, origin)</code>: Moves the cursor. Origins: <code>SEEK_SET</code> (from start), <code>SEEK_CUR</code> (from current position), <code>SEEK_END</code> (from end).",
                        "<code>ftell(fptr)</code>: Returns the current cursor position as a <code>long</code> — bytes from the start of the file.",
                        "<code>rewind(fptr)</code>: Shorthand for <code>fseek(fptr, 0, SEEK_SET)</code>. Moves the cursor back to the beginning and clears error flags."
                    ],
                    code: `#include <stdio.h>

int main() {
    FILE *f = fopen("data.txt", "w+"); // Open for read and write
    if (!f) { perror("fopen"); return 1; }
    
    fprintf(f, "ABCDEFGHIJ");
    
    // Jump to position 5 from start
    fseek(f, 5, SEEK_SET);
    char ch;
    fread(&ch, 1, 1, f);
    printf("Char at pos 5: %c\\n", ch); // F
    printf("Position now: %ld\\n", ftell(f)); // 6
    
    // Go back to start
    rewind(f);
    fread(&ch, 1, 1, f);
    printf("After rewind: %c\\n", ch); // A
    
    fclose(f);
    return 0;
}`,
                    output: "Char at pos 5: F\nPosition now: 6\nAfter rewind: A",
                    tip: "A common use of <code>ftell</code> + <code>fseek</code> is measuring file size: <code>fseek(fptr, 0, SEEK_END)</code> then <code>ftell(fptr)</code> gives the total byte count. Then <code>rewind(fptr)</code> to read from the beginning."
                }
            ]
        },
        {
            id: "exit-handling",
            title: "Exiting Programs",
            explanation: "Every program we've written exits by returning from <code>main()</code>. That works fine for simple programs, but real software sometimes needs to exit from deep inside a call stack, register cleanup functions that run at exit, or terminate abnormally. C provides several functions for controlled program termination.",
            sections: [
                {
                    title: "exit() and Return Status",
                    content: "<code>exit()</code> from <code>&lt;stdlib.h&gt;</code> terminates the program from anywhere — not just from <code>main()</code>. It takes a status code: <code>EXIT_SUCCESS</code> (0) for success, <code>EXIT_FAILURE</code> (1) for failure. These are macros defined in <code>&lt;stdlib.h&gt;</code>. Before exiting, <code>exit()</code> flushes and closes all open file streams and runs any functions registered with <code>atexit()</code>.",
                    points: [
                        "<code>exit(EXIT_SUCCESS)</code>: Clean exit. All open files are flushed and closed. <code>atexit</code> handlers run.",
                        "<code>exit(EXIT_FAILURE)</code>: Exit signaling an error. Same cleanup as above, just a different return code to the OS.",
                        "<strong>Difference from <code>return</code> in main()</strong>: Both trigger cleanup and exit. <code>exit()</code> can be called from any function, not just <code>main()</code>. <code>return 0</code> in <code>main()</code> behaves identically to <code>exit(0)</code>."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

FILE *logFile = NULL;

void openLog(const char *filename) {
    logFile = fopen(filename, "w");
    if (logFile == NULL) {
        perror("Cannot open log file");
        exit(EXIT_FAILURE); // Exit from a non-main function
    }
    fprintf(logFile, "Log started.\\n");
}

int main() {
    openLog("app.log");
    
    fprintf(logFile, "Doing work...\\n");
    printf("Program running.\\n");
    
    fclose(logFile);
    return EXIT_SUCCESS;
}`,
                    output: "Program running."
                },
                {
                    title: "atexit() — Exit Handlers",
                    content: "<code>atexit()</code> registers a function to be called automatically when the program exits via <code>exit()</code> or by returning from <code>main()</code>. You can register up to 32 functions (guaranteed by the standard; implementations often allow more). They're called in reverse order of registration — last registered, first called. This is extremely useful for cleanup code: closing files, freeing resources, saving state.",
                    points: [
                        "<strong>Registration</strong>: <code>atexit(my_cleanup_func)</code>. The function must take no arguments and return void.",
                        "<strong>Order</strong>: Multiple handlers are called in LIFO (Last In, First Out) order.",
                        "<strong>When it runs</strong>: On <code>exit()</code>, on return from <code>main()</code>. NOT on <code>abort()</code> or abnormal termination.",
                        "<strong>Practical use</strong>: Register cleanup handlers at the point where you acquire resources — open a file, register its closer; allocate memory, register its freer. This keeps resource management close to resource acquisition."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

void cleanup1(void) {
    printf("cleanup1: closing files\\n");
}

void cleanup2(void) {
    printf("cleanup2: freeing resources\\n");
}

void cleanup3(void) {
    printf("cleanup3: saving state\\n");
}

int main() {
    // Register handlers - called in REVERSE order at exit
    atexit(cleanup1);
    atexit(cleanup2);
    atexit(cleanup3);
    
    printf("Program running...\\n");
    
    return 0; // Triggers all atexit handlers
}`,
                    output: "Program running...\ncleanup3: saving state\ncleanup2: freeing resources\ncleanup1: closing files"
                },
                {
                    title: "abort() — Abnormal Termination",
                    content: "<code>abort()</code> terminates the program immediately and abnormally. It generates a <code>SIGABRT</code> signal, which by default causes the program to exit with a non-zero status and — on most systems — produces a core dump (a snapshot of the process memory for debugging). Unlike <code>exit()</code>, <code>abort()</code> does NOT flush open file streams, close files, or run <code>atexit()</code> handlers. It's the nuclear option: use it for truly unrecoverable errors where the program is in a state so bad that any attempt at cleanup might make things worse.",
                    code: `#include <stdio.h>
#include <stdlib.h>

void critical_operation(int *data, int size) {
    if (data == NULL || size <= 0) {
        fprintf(stderr, "FATAL: critical_operation called with invalid args\\n");
        abort(); // Immediate abnormal exit
    }
    // ... do work ...
}

int main() {
    // This would abort:
    // critical_operation(NULL, 0);
    
    int arr[] = {1, 2, 3};
    critical_operation(arr, 3);
    printf("Completed normally.\\n");
    return 0;
}`,
                    output: "Completed normally.",
                    tip: "The practical hierarchy: use <code>assert()</code> for programming errors during development (disabled in release builds), <code>exit(EXIT_FAILURE)</code> for runtime errors your program detects and can report cleanly, and <code>abort()</code> only for truly catastrophic, unrecoverable failures where the program state is corrupted."
                }
            ]
        },
        {
            id: "preprocessor",
            title: "The Preprocessor",
            explanation: "Before the compiler ever sees your code, a separate tool runs first: the preprocessor. It scans for lines starting with <code>#</code> and acts on them — including files, substituting text, stripping out entire sections of code. The critical thing to understand is that the preprocessor is not a C program and does not understand C. It's a text manipulation tool operating on raw characters.",
            sections: [
                {
                    title: "Concept: Text Replacement",
                    content: "Every preprocessor directive is resolved before a single line of C is compiled. <code>#include</code> literally copies the contents of the specified file into your source. <code>#define</code> performs find-and-replace across your entire file. The compiler then receives the result — it has no idea any of this happened.",
                    warning: "The preprocessor is deliberately simple. It finds and replaces text with zero understanding of what that text means in context. It doesn't evaluate expressions, respect types, or follow operator precedence. Every unexpected behavior of macros ultimately traces back to this: you are doing text substitution, not calling a function."
                },
                {
                    title: "#define (Macros)",
                    content: "The <code>#define</code> directive creates a macro — a name that gets replaced with a value or expression everywhere it appears before compilation. Object-like macros are simple constants. Function-like macros take parameters and expand into expressions.",
                    code: `#include <stdio.h>

#define PI 3.14159
#define SQUARE(x) ((x) * (x))

int main() {
    printf("PI is: %f\\n", PI);
    printf("Square of 5: %d\\n", SQUARE(5));
    
    return 0;
}`,
                    output: "PI is: 3.14159\nSquare of 5: 25"
                },
                {
                    title: "The Parentheses Danger",
                    content: "Because macros are text substitution, if you write <code>SQUARE(2+3)</code>, the macro doesn't receive the value 5 — it receives the text <code>2+3</code>, and the expansion becomes <code>2+3 * 2+3</code>. Without parentheses around the parameter, operator precedence kicks in giving you 13 instead of 25.",
                    code: `#include <stdio.h>

#define BAD_SQUARE(x) x * x

int main() {
    // BAD_SQUARE(2+3) expands to: 2 + 3 * 3 + 2 = 13
    printf("Bad Square result: %d\\n", BAD_SQUARE(2+3));
    
    return 0;
}`,
                    output: "Bad Square result: 13",
                    tip: "There's a second macro trap: side effects in arguments. <code>SQUARE(x++)</code> expands to <code>((x++) * (x++))</code> — the increment happens twice. A real function would only evaluate <code>x++</code> once. Prefer <code>const</code> variables for constants and <code>static inline</code> functions for simple operations — they get the same zero-overhead benefit without the text-substitution footguns."
                },
                {
                    title: "Variadic Macros (__VA_ARGS__)",
                    content: "Just like variadic functions, macros can accept a variable number of arguments. The ellipsis <code>...</code> in the parameter list captures the extra arguments, and <code>__VA_ARGS__</code> in the expansion inserts them. This is how you write macros that wrap functions like <code>printf</code>.",
                    points: [
                        "<strong>Syntax</strong>: <code>#define MACRO(fmt, ...) something(__VA_ARGS__)</code>",
                        "<strong>Common use</strong>: Wrapping <code>printf</code> to add a prefix, logging with file and line info, or adding conditional behavior.",
                        "<strong>GCC extension</strong>: <code>##__VA_ARGS__</code> removes the preceding comma when <code>__VA_ARGS__</code> is empty — useful for macros that take zero or more extra args."
                    ],
                    code: `#include <stdio.h>

// Debug print macro: prints file, line, and the message
#define DEBUG_PRINT(fmt, ...) \\
    printf("[%s:%d] " fmt "\\n", __FILE__, __LINE__, ##__VA_ARGS__)

// Log macro with severity
#define LOG(level, fmt, ...) \\
    printf("[%s] " fmt "\\n", level, ##__VA_ARGS__)

int main() {
    int x = 42;
    DEBUG_PRINT("Starting program");
    DEBUG_PRINT("x = %d", x);
    LOG("INFO", "User logged in: %s", "Alice");
    LOG("WARN", "Memory usage at %d%%", 85);
    return 0;
}`,
                    output: "[main.c:12] Starting program\n[main.c:13] x = 42\n[INFO] User logged in: Alice\n[WARN] Memory usage at 85%"
                },
                {
                    title: "Built-in Preprocessor Macros",
                    content: "The C preprocessor defines several macros automatically — you don't have to define them yourself. These are invaluable for debugging and logging because they let you embed the file name, line number, and function name directly into your messages at compile time.",
                    points: [
                        "<code>__FILE__</code>: A string literal containing the name of the current source file (e.g., <code>\"main.c\"</code>).",
                        "<code>__LINE__</code>: An integer constant containing the current line number in the source file.",
                        "<code>__DATE__</code>: A string literal of the form <code>\"Jan  1 2024\"</code> — the date when the file was compiled.",
                        "<code>__TIME__</code>: A string literal of the form <code>\"12:34:56\"</code> — the time when the file was compiled.",
                        "<code>__func__</code>: A string containing the name of the current function. Technically not a preprocessor macro — it's a predefined identifier in C99 — but works the same way."
                    ],
                    code: `#include <stdio.h>

void exampleFunction(void) {
    printf("In function: %s\\n", __func__);
    printf("At line: %d\\n", __LINE__);
}

int main() {
    printf("File: %s\\n", __FILE__);
    printf("Compiled: %s at %s\\n", __DATE__, __TIME__);
    printf("Line: %d\\n", __LINE__);
    
    exampleFunction();
    
    return 0;
}`,
                    output: "File: main.c\nCompiled: Jan  1 2024 at 12:00:00\nLine: 11\nIn function: exampleFunction\nAt line: 5",
                    tip: "The killer combo is <code>__FILE__</code>, <code>__LINE__</code>, and <code>__func__</code> together in a debug print macro. When a bug triggers, you know exactly where in the code it happened — file, function, and line number — without a debugger. This is the poor man's stack trace and it works everywhere."
                },
                {
                    title: "Conditional Compilation",
                    content: "The preprocessor can include or exclude entire blocks of code based on conditions. <code>#if</code>, <code>#ifdef</code>, <code>#ifndef</code>, and <code>#endif</code> act as compile-time switches. The excluded code doesn't just get skipped at runtime — it literally doesn't exist in the compiled binary at all.",
                    code: `#include <stdio.h>

#define DEBUG 1

int main() {
    int x = 100;
    
#if DEBUG
    printf("Debug Info: x is %d\\n", x);
#endif

    printf("Program running...\\n");
    return 0;
}`,
                    output: "Debug Info: x is 100\nProgram running..."
                },
                {
                    title: "Include Guards",
                    content: "When a project spans multiple files, the same header may be included more than once, causing 'redefinition' compiler errors. Include guards solve this by making a header file include itself only once, no matter how many times it's referenced.",
                    points: [
                        "<strong>The pattern</strong>: Wrap the entire header file in an <code>#ifndef</code> / <code>#define</code> / <code>#endif</code> block. The first time the header is included, the guard macro isn't defined, so the contents are processed and the macro gets defined. Every subsequent include finds the macro already defined and skips the contents.",
                        "<strong>Name the guard uniquely</strong>: The convention is to use the filename in uppercase with dots and slashes replaced by underscores: <code>student.h</code> → <code>STUDENT_H</code>.",
                        "<strong><code>#pragma once</code></strong>: A non-standard but universally supported alternative. One line at the top of the header file. Same effect, less typing. Use it for new code unless you need strict standards conformance."
                    ],
                    code: `// === student.h ===

#ifndef STUDENT_H
#define STUDENT_H

typedef struct {
    char name[50];
    int age;
    float gpa;
} Student;

void printStudent(Student s); // Prototype

#endif // STUDENT_H


// === Alternative (simpler) ===
// #pragma once
//
// typedef struct { ... } Student;`
                }
            ]
        },
        {
            id: "c23-attributes",
            title: "C23 Standard Attributes: [[nodiscard]], [[deprecated]], [[fallthrough]], [[maybe_unused]]",
            explanation: "C23 standardizes a portable attribute syntax using double square brackets. Attributes are annotations that convey intent to the compiler, enabling better warnings, clearer API contracts, and more aggressive optimization. Unlike GCC's <code>__attribute__((...))</code> extensions, standard attributes are part of the C language specification and work across all conforming compilers.",
            sections: [
                {
                    title: "[[nodiscard]]: Enforce Return Value Checking",
                    content: "<code>[[nodiscard]]</code> tells the compiler to warn whenever the return value of a function is discarded (ignored). This is essential for functions whose return value indicates success/failure or carries the allocated resource — silently ignoring these is a classic source of bugs.",
                    code: `#include <stdio.h>
#include <stdlib.h>

// C23: compiler warns if return value is ignored
[[nodiscard]]
int connect_to_server(const char *host, int port) {
    printf("Connecting to %s:%d...\\n", host, port);
    return -1;  // -1 = error in this example
}

[[nodiscard("allocated memory must be freed")]]  // C23: with message
void* create_buffer(size_t size) {
    return malloc(size);
}

int main(void) {
    // connect_to_server("localhost", 8080);  // WARN: discarded [[nodiscard]]

    int status = connect_to_server("localhost", 8080);
    if (status < 0) {
        printf("Connection failed: %d\\n", status);
    }

    void *buf = create_buffer(1024);
    if (!buf) {
        printf("Allocation failed\\n");
        return 1;
    }
    printf("Buffer allocated\\n");
    free(buf);
    return 0;
}`,
                    output: `Connecting to localhost:8080...
Connection failed: -1
Buffer allocated`,
                    tip: "Apply <code>[[nodiscard]]</code> to any function where ignoring the return value is almost certainly a bug: memory allocators, file openers, error codes, handles, and locks. This turns a silent bug into a compiler warning — the best possible time to catch it."
                },
                {
                    title: "[[deprecated]]: Mark Obsolete APIs",
                    content: "<code>[[deprecated]]</code> marks a function, type, or variable as obsolete. Any use of it triggers a compiler warning, optionally with a message explaining what to use instead. This is how you evolve an API without breaking existing code while guiding users to the new version.",
                    code: `#include <stdio.h>

// Old API — deprecated, use new_process() instead
[[deprecated("use new_process() with explicit flags instead")]]
int old_process(int data) {
    return data * 2;
}

// New API
int new_process(int data, int flags) {
    (void)flags;
    return data * 2;
}

// Deprecated struct — compiler warns on use
[[deprecated]]
typedef struct { int x, y; } OldPoint;

typedef struct { double x, y; } Point;  // New version

int main(void) {
    // Using deprecated functions triggers a warning at compile time:
    // int r = old_process(10);  // warning: 'old_process' is deprecated

    int result = new_process(10, 0);   // No warning
    printf("Result: %d\\n", result);

    Point p = {1.0, 2.0};
    printf("Point: (%.1f, %.1f)\\n", p.x, p.y);
    return 0;
}`,
                    output: `Result: 20
Point: (1.0, 2.0)`
                },
                {
                    title: "[[fallthrough]]: Explicit Switch Fallthrough",
                    content: "Falling through a <code>switch</code> <code>case</code> without a <code>break</code> is almost always a bug — which is why modern compilers warn about it. But sometimes fallthrough is intentional. <code>[[fallthrough]]</code> is an explicit annotation that tells the compiler: 'yes, I meant to fall through here, this is not a mistake.'",
                    code: `#include <stdio.h>

// HTTP status code classifier
void classify_status(int code) {
    switch (code / 100) {
        case 1:
            printf("1xx: Informational\\n");
            break;
        case 2:
            printf("2xx: Success\\n");
            break;
        case 3:
            printf("3xx: Redirection\\n");
            break;
        case 4:
            [[fallthrough]];   // C23: intentional fallthrough — no warning
        case 5:
            printf("%dxx: Error (%s)\\n", code / 100,
                   code / 100 == 4 ? "client" : "server");
            break;
        default:
            printf("Unknown status\\n");
    }
}

int main(void) {
    classify_status(200);
    classify_status(301);
    classify_status(404);  // Falls through to 5xx handler
    classify_status(500);
    return 0;
}`,
                    output: `2xx: Success
3xx: Redirection
4xx: Error (client)
5xx: Error (server)`
                },
                {
                    title: "[[maybe_unused]]: Suppress Unused Warnings",
                    content: "<code>[[maybe_unused]]</code> suppresses warnings about unused variables, parameters, or functions. This is common in debug-only parameters, platform-specific code, and callback functions where the signature is fixed but not all parameters are always needed.",
                    code: `#include <stdio.h>

// Callback with a fixed signature — 'userdata' not always needed
void on_click([[maybe_unused]] int x,
              [[maybe_unused]] int y,
              [[maybe_unused]] void *userdata) {
    printf("Click event received\\n");
    // x, y, userdata not used — no warning with [[maybe_unused]]
}

// Debug-only parameter
void process(int value, [[maybe_unused]] const char *debug_label) {
#ifdef DEBUG
    printf("[%s] processing %d\\n", debug_label, value);
#endif
    // In release builds, debug_label is unused — no warning
    printf("Processed: %d\\n", value * 2);
}

// Function used only in debug builds
[[maybe_unused]]
static void dump_state(int *arr, int n) {
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
}

int main(void) {
    on_click(100, 200, NULL);
    process(21, "test-label");
    return 0;
}`,
                    output: `Click event received
Processed: 42`,
                    tip: "The four standard attributes — <code>[[nodiscard]]</code>, <code>[[deprecated]]</code>, <code>[[fallthrough]]</code>, and <code>[[maybe_unused]]</code> — should be the first attributes you reach for in any new C23 codebase. They communicate intent to both the compiler and the reader without any runtime cost."
                },
                {
                    title: "#embed: Embedding Binary Resources (C23)",
                    content: "C23 introduces <code>#embed</code>, which lets you include the raw bytes of a file directly into your source code at compile time. Previously this required external tools (like <code>xxd</code> or custom scripts) to convert files into C arrays. Now you can embed fonts, images, shaders, certificates, or any binary data directly.",
                    code: `#include <stdio.h>
#include <stddef.h>

// C23: embed a file's bytes as a byte array at compile time
// This embeds the literal bytes of "logo.png" into the binary
// const unsigned char logo_data[] = {
//     #embed "logo.png"
// };
// const size_t logo_size = sizeof(logo_data);

// For this example, we simulate what #embed does:
const unsigned char icon_data[] = {
    #embed "icon.bin"   // Real C23 — compiler includes file bytes
    // Simulated equivalent (what the compiler would produce):
    // 0x89, 0x50, 0x4E, 0x47, ...
};

// #embed with limits — take only first 64 bytes:
// const unsigned char header[] = { #embed "file.bin" limit(64) };

// #embed with a fallback if file doesn't exist:
// #if __has_embed("cert.pem")
//     const char cert[] = { #embed "cert.pem", 0 };  // null-terminate
// #else
//     #error "Certificate file required"
// #endif

int main(void) {
    printf("Resource embedding with #embed (C23)\\n");
    printf("Before #embed, developers used tools like xxd:\\n");
    printf("  xxd -i logo.png > logo_data.h\\n");
    printf("Now: just write  #embed \\"logo.png\\"  in an initializer.\\n");
    return 0;
}`,
                    output: `Resource embedding with #embed (C23)
Before #embed, developers used tools like xxd:
  xxd -i logo.png > logo_data.h
Now: just write  #embed "logo.png"  in an initializer.`,
                    warning: "<code>#embed</code> requires C23 compiler support. Check with <code>__has_embed(\"file\")</code> before using it if portability matters. The file path is relative to the source file unless the compiler's include path overrides this. The embedded data is raw bytes — for text files, remember to add a null terminator if you need a C string."
                }
            ]
        }
    ],
    
    quiz: [
        {
            question: "What is the main difference between a struct and a union?",
            options: ["Syntax", "Struct members share memory, Union members don't", "Union members share memory, Struct members don't", "No difference"],
            answer: 2
        },
        {
            question: "What operator is used to access a member via a struct pointer?",
            options: [".", "->", "::", "*"],
            answer: 1
        },
        {
            question: "What does 'w' mode do in fopen?",
            options: ["Reads file", "Writes to file (erases existing)", "Appends to file", "Writes to file (keeps existing)"],
            answer: 1
        },
        {
            question: "When does the preprocessor run?",
            options: ["After compilation", "During runtime", "Before compilation", "During linking"],
            answer: 2
        },
        {
            question: "What is an enum?",
            options: ["A new variable type", "A list of named integer constants", "A type of struct", "A macro"],
            answer: 1
        },
        {
            question: "Why do we use fclose?",
            options: ["To delete the file", "To save changes and free memory", "To pause reading", "It is optional"],
            answer: 1
        },
        {
            question: "What does typedef do?",
            options: ["Defines a new type", "Creates an alias for a type", "Deletes a type", "Checks type size"],
            answer: 1
        },
        {
            question: "What does a struct designated initializer look like?",
            options: ["{name, age, gpa}", "{.name = val, .age = val}", "(name=val)", "[name: val]"],
            answer: 1
        },
        {
            question: "Can you use == to compare two structs?",
            options: ["Yes, always", "Only if they are the same type", "No, you must compare fields individually", "Only with memcmp"],
            answer: 2
        },
        {
            question: "What does __LINE__ contain?",
            options: ["The function name", "The current line number", "The file name", "The compile date"],
            answer: 1
        }
    ],
    
    practice: [
        {
            title: "Bank Account Struct",
            difficulty: "medium",
            problem: "Define a struct 'Account' with account number (int), name (string), and balance (float). Create one instance using a designated initializer, populate it, and print the details.",
            solution: `#include <stdio.h>
#include <string.h>

typedef struct {
    int accNum;
    char name[50];
    float balance;
} Account;

int main() {
    Account myAcc = {
        .accNum  = 101,
        .balance = 5000.50f
    };
    strcpy(myAcc.name, "John Doe");
    
    printf("Account: %d\\nName: %s\\nBalance: $%.2f\\n", 
           myAcc.accNum, myAcc.name, myAcc.balance);
           
    return 0;
}`
        },
        {
            title: "File Writer",
            difficulty: "medium",
            problem: "Write a program that asks the user for 3 lines of text and saves them to 'notes.txt'. Use perror() for error handling.",
            solution: `#include <stdio.h>
#include <stdlib.h>

int main() {
    char text[100];
    FILE *fptr = fopen("notes.txt", "w");
    
    if (!fptr) {
        perror("fopen");
        return EXIT_FAILURE;
    }
    
    printf("Enter 3 lines:\\n");
    for (int i = 0; i < 3; i++) {
        fgets(text, 100, stdin);
        fprintf(fptr, "%s", text);
    }
    
    fclose(fptr);
    printf("Saved!\\n");
    return EXIT_SUCCESS;
}`
        },
        {
            title: "Safe Macro",
            difficulty: "hard",
            problem: "Write a safe macro MAX(a, b) that returns the larger of two numbers. Ensure it is wrapped in parentheses to avoid precedence issues.",
            solution: `#include <stdio.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main() {
    int x = 10, y = 20;
    printf("Max: %d\\n", MAX(x, y));
    printf("Max expression: %d\\n", MAX(5+5, 10+10));
    return 0;
}`
        },
        {
            title: "Cleanup with atexit",
            difficulty: "hard",
            problem: "Write a program that opens a log file, registers an atexit handler to close and report on it, does some work, and exits normally. Observe that the handler runs automatically.",
            solution: `#include <stdio.h>
#include <stdlib.h>

FILE *logFile = NULL;
int logLines = 0;

void closeLog(void) {
    if (logFile) {
        fprintf(logFile, "--- Log closed, %d lines written ---\\n", logLines);
        fclose(logFile);
        printf("atexit: log file closed (%d lines)\\n", logLines);
    }
}

void logMessage(const char *msg) {
    if (logFile) {
        fprintf(logFile, "%s\\n", msg);
        logLines++;
    }
}

int main() {
    logFile = fopen("app.log", "w");
    if (!logFile) { perror("fopen"); return EXIT_FAILURE; }
    
    atexit(closeLog); // Registered - runs when main() returns
    
    logMessage("Program started");
    logMessage("Doing work...");
    logMessage("Work complete");
    
    printf("Main done, returning...\\n");
    return EXIT_SUCCESS; // closeLog() runs automatically here
}`
        }
    ],
    
    exam: [
        {
            question: "What is the size of a union with int (4 bytes) and double (8 bytes)?",
            options: ["4 bytes", "8 bytes", "12 bytes", "2 bytes"],
            answer: 1
        },
        {
            question: "fscanf is used for:",
            options: ["Reading from keyboard", "Reading formatted data from file", "Writing to file", "Closing file"],
            answer: 1
        },
        {
            question: "enum values are stored as:",
            options: ["Strings", "Integers", "Floats", "Pointers"],
            answer: 1
        },
        {
            question: "Preprocessor directives end with:",
            options: ["Semicolon", "Newline", "Hash", "Bracket"],
            answer: 1
        },
        {
            question: "Which mode opens a file for reading AND writing without erasing it?",
            options: ["\"r\"", "\"w+\"", "\"r+\"", "\"rw\""],
            answer: 2
        },
        {
            question: "Structure padding is done for:",
            options: ["Security", "Alignment", "Encryption", "Compression"],
            answer: 1
        },
        {
            question: "What happens if you use a macro like SQUARE(x++)?",
            options: ["x increments once", "x increments twice", "Compiler error", "Nothing"],
            answer: 1
        },
        {
            question: "typedef char* String; String s; What is s?",
            options: ["A char", "A char pointer", "A struct", "An int"],
            answer: 1
        },
        {
            question: "What does atexit() do?",
            options: ["Exits the program immediately", "Registers a function to call when the program exits", "Closes all open files", "Aborts the program"],
            answer: 1
        },
        {
            question: "Which binary file I/O function reads raw bytes from a file?",
            options: ["fscanf", "fgets", "fread", "fgetc"],
            answer: 2
        },
        {
            question: "What does [[nodiscard]] do when applied to a function?",
            options: [
                "Prevents the function from being called",
                "Causes a compiler warning if the return value is discarded",
                "Makes the return value const",
                "Forces the function to be inlined"
            ],
            answer: 1
        },
        {
            question: "[[fallthrough]] is used in a switch statement to:",
            options: [
                "Skip to the default case",
                "Exit the switch immediately",
                "Explicitly signal intentional fallthrough to the next case, suppressing warnings",
                "Force execution of all remaining cases"
            ],
            answer: 2
        },
        {
            question: "What is the purpose of [[maybe_unused]]?",
            options: [
                "Marks a variable as potentially uninitialized",
                "Suppresses compiler warnings about unused variables, parameters, or functions",
                "Makes the variable optional at link time",
                "Allows the variable to be optimized away at runtime"
            ],
            answer: 1
        },
        {
            question: "What does C23's #embed directive do?",
            options: [
                "Embeds another C source file as code",
                "Includes a header file with embedding semantics",
                "Includes the raw bytes of a file as data in a byte array initializer",
                "Embeds assembly instructions into C code"
            ],
            answer: 2
        }
    ]
};

window.ModuleAdvanced = ModuleAdvanced;