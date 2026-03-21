const ModuleBeginner = {
    description: "The absolute foundation: understanding how C programs work, storing data, and interacting with the user. Yes, you have to start here. No shortcuts.",
    
    lessons: [
        {
            id: "structure",
            title: "Anatomy of a C Program",
            explanation: "Before writing a single line of code, you need to understand what you're looking at. C programs have a very specific structure, and unlike some modern languages that are forgiving when you forget things, C will refuse to compile and give you errors that feel like personal attacks. Let's avoid that.",
            sections: [
                {
                    title: "The Hello World Breakdown",
                    content: "Every programming tutorial in existence starts with 'Hello, World!' and we're not going to be different. But unlike most tutorials, we're actually going to explain every single character in this program — because every single character matters in C.",
                    code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
                    output: "Hello, World!"
                },
                {
                    title: "Line-by-Line Explanation",
                    points: [
                        "<strong>#include &lt;stdio.h&gt;</strong>: This is a preprocessor directive. Think of it as the very first thing you do when you arrive at work — you go get your tools. <code>stdio.h</code> is a header file that contains the definitions for 'Standard Input/Output' functions. Without this line, the compiler sees <code>printf</code> and has absolutely no idea what you're talking about. It will tell you so, loudly.",
                        "<strong>int main()</strong>: This defines the main function — the entry point of your entire program. When the operating system runs your program, it looks for <code>main</code> specifically. If it doesn't find it, your program won't run. The <code>int</code> before it means this function will hand back an integer value when it finishes. Think of it like a contractor who, when done with a job, hands you a report: '0 means everything went fine'.",
                        "<strong>{ }</strong>: These curly braces define a block of code — everything that belongs to <code>main</code>. Open brace <code>{</code> says 'we're starting', close brace <code>}</code> says 'we're done'. Missing one of these is probably the most common beginner mistake after forgetting semicolons. The compiler error will make you feel like you've broken reality.",
                        "<strong>printf(...)</strong>: This is a function call. You are telling the program: 'go run the function named printf, and pass it this text'. The text inside the double quotes is called a string literal — it's taken exactly as written. The semicolon <code>;</code> at the end is mandatory. Every statement in C ends with one. Think of it as a period in a sentence. Forget it and the compiler will complain about the next line instead, which is extremely confusing.",
                        "<strong>\\n</strong>: This is called an escape sequence. Since you can't actually press Enter inside a string, you write <code>\\n</code> to represent a newline character. Without it, the next thing printed will appear right after 'World!' on the same line, which looks terrible.",
                        "<strong>return 0</strong>: This ends <code>main</code> and reports back to the operating system. Zero means 'everything went fine, no problems'. Any non-zero value conventionally signals that something went wrong. You won't notice the difference in a simple program, but once you start writing scripts and shell commands, this becomes very important."
                    ]
                },
                {
                    title: "Comments",
                    content: "Comments are text in your source code that the compiler completely ignores. They exist purely for humans — to explain what code does, leave notes for yourself, or temporarily disable a line without deleting it. In a language as terse as C, good comments are the difference between readable code and archaeology.",
                    points: [
                        "<strong>Single-line comment</strong>: Start with <code>//</code>. Everything from those two slashes to the end of the line is ignored by the compiler. This is the comment style you'll use 90% of the time.",
                        "<strong>Multi-line comment</strong>: Start with <code>/*</code> and end with <code>*/</code>. Everything between them is ignored, even if it spans many lines. Useful for temporarily blocking out a large section of code or writing longer explanations.",
                        "<strong>You cannot nest multi-line comments</strong>: Writing <code>/* outer /* inner */ still outer */</code> doesn't work — the first <code>*/</code> closes the whole thing, leaving 'still outer */' as live code. This catches people off guard."
                    ],
                    code: `#include <stdio.h>

int main() {
    // This is a single-line comment. The compiler skips this entire line.
    
    printf("Hello\\n"); // Comments can also go at the end of a line of code.
    
    /*
        This is a multi-line comment.
        It can span as many lines as you want.
        Useful for detailed explanations or temporarily
        disabling a block of code during debugging.
    */
    
    // printf("This line is commented out and won't run.");
    
    return 0;
}`,
                    output: "Hello",
                    tip: "A common debugging trick: instead of deleting code you're not sure about, comment it out with <code>//</code>. You can uncomment it just as easily if you need it back. This is faster and safer than deletion — especially before you have version control set up."
                },
                {
                    title: "The Compilation Process (Simplified)",
                    content: "Here's the thing — computers don't understand C. They never did. They understand machine code: raw binary instructions specific to the processor. C is written for humans to read. The journey from your text file to a running program involves several steps, and knowing these steps will save you enormous confusion when something goes wrong.",
                    points: [
                        "<strong>Source Code</strong>: You write <code>program.c</code> in a text editor. It's just a text file. Nothing special about it yet.",
                        "<strong>Preprocessor</strong>: Before actual compilation starts, the preprocessor scans for lines beginning with <code>#</code>. <code>#include &lt;stdio.h&gt;</code> tells it to literally copy-paste the contents of that header file into your code. By the time the preprocessor is done, your file is much larger than you wrote.",
                        "<strong>Compiler</strong>: This is the translator. It reads your (now preprocessed) C code and converts it into machine code — binary instructions the CPU can actually execute. This is also where syntax errors are caught. Forgot a semicolon? The compiler will tell you here.",
                        "<strong>Linker</strong>: Your code calls functions like <code>printf</code>, but where's the actual machine code for <code>printf</code>? It lives in a pre-compiled library. The linker's job is to stitch your machine code together with the library code to produce a single, complete executable file.",
                        "<strong>Execution</strong>: You run the executable. The OS loads it into memory, finds <code>main</code>, and off you go."
                    ],
                    tip: "Think of the compiler as a very strict translator who refuses to translate your document if you have a single grammatical mistake. A human would understand 'I goed to store' — the compiler would throw it back in your face. This is actually a feature, not a bug. It catches mistakes before they become invisible runtime disasters."
                }
            ]
        },
        {
            id: "printf",
            title: "Printing to the Screen",
            explanation: "Output is how your program communicates results to the outside world. In C, the primary weapon for this is <code>printf</code> — short for 'Print Formatted'. It's one of the most powerful and most used functions in all of C, and understanding it well will serve you for your entire C career.",
            sections: [
                {
                    title: "Basic Printing",
                    content: "The simplest use: put text in double quotes, and <code>printf</code> will put it on screen. You can call it as many times as you want. Each call picks up right where the last one left off — unless you add a <code>\\n</code> to create a new line.",
                    code: `#include <stdio.h>

int main() {
    printf("C is powerful.\\n");
    printf("C is fast.\\n");
    return 0;
}`,
                    output: "C is powerful.\nC is fast."
                },
                {
                    title: "Escape Sequences",
                    content: "Some characters can't be typed directly into a string — you can't press the Tab key and have it appear literally inside your code in a meaningful way, and you definitely can't press Enter mid-string. Escape sequences solve this. They start with a backslash <code>\\</code>, which signals 'the next character is special'.",
                    points: [
                        "<code>\\n</code> — Newline: Moves the cursor down to the start of the next line. You will use this constantly. Every line of output should usually end with one.",
                        "<code>\\t</code> — Tab: Inserts a horizontal tab. Great for aligning columns of text without going insane trying to count spaces.",
                        "<code>\\\\</code> — Backslash: Since <code>\\</code> is the escape character, to print an actual backslash you have to escape the escape. Yes, this feels silly. Welcome to C.",
                        "<code>\\\"</code> — Double Quote: Double quotes mark the start and end of a string. If you want a quote character inside the string itself, you have to escape it, otherwise C thinks you're ending the string early."
                    ],
                    code: `#include <stdio.h>

int main() {
    printf("Column 1\\tColumn 2\\n");
    printf("He said, \\"Hello!\\"\\n");
    printf("Path: C:\\\\Programs\\\\n");
    return 0;
}`,
                    output: "Column 1    Column 2\nHe said, \"Hello!\"\nPath: C:\\Programs\\"
                },
                {
                    title: "Format Specifiers (Printing Variables)",
                    content: "This is where <code>printf</code> earns the 'Formatted' part of its name. You rarely want to print only hardcoded text — you want to print the values of variables. Format specifiers are placeholders inside the string that get replaced with actual values at runtime. The format string and the variable list must match up in type and order, or you will get garbage output (at best) or a crash (at worst).",
                    points: [
                        "<code>%d</code> or <code>%i</code> — Integer (whole numbers, positive or negative). This is the one you'll use most.",
                        "<code>%f</code> — Float or Double (decimal numbers). Prints 6 decimal places by default, which is usually too many.",
                        "<code>%c</code> — Character (a single character, like 'A' or '7').",
                        "<code>%s</code> — String (a sequence of characters, i.e., text).",
                        "<code>%x</code> or <code>%X</code> — Integer printed in hexadecimal (lowercase/uppercase). Useful for memory addresses and bit patterns.",
                        "<code>%%</code> — Prints a literal percent sign. Because <code>%</code> is special, you have to escape it too, just like the backslash."
                    ],
                    code: `#include <stdio.h>

int main() {
    int quantity = 5;
    float price = 19.99;
    int flags = 255; // 0xFF in hex
    
    printf("I want to buy %d items.\\n", quantity);
    printf("The price is $%.2f each.\\n", price);
    printf("Flags in hex: 0x%X\\n", flags); // 0xFF
    
    return 0;
}`,
                    output: "I want to buy 5 items.\nThe price is $19.99 each.\nFlags in hex: 0xFF",
                    tip: "The <code>%.2f</code> means 'print this float with exactly 2 decimal places'. If you use plain <code>%f</code>, you'll get something like <code>19.990000</code>, which is technically correct but looks awful. The format is <code>%[width].[precision]f</code> — you can control how many digits appear on each side of the decimal point."
                }
            ]
        },
        {
            id: "variables",
            title: "Variables and Data Types",
            explanation: "Variables are how programs remember things. Every piece of data your program works with — a user's age, a product price, someone's initial — needs to live somewhere in memory. In C, you're responsible for telling the compiler exactly what kind of data you plan to store. This is called static typing, and it exists because C wants to know precisely how much memory to reserve and how to interpret the raw bytes sitting at that location.",
            sections: [
                {
                    title: "The 'Box' Analogy",
                    content: "The classic mental model for a variable is a labelled box in a warehouse (the warehouse being your computer's RAM). Every variable has three aspects:",
                    points: [
                        "<strong>Declaration</strong>: Telling the warehouse, 'I need a box that holds an integer, label it <code>age</code>'. In C: <code>int age;</code>. The computer finds an empty spot in memory and reserves it. The value inside at this point is undefined — it's whatever garbage was in that memory before. Do not assume it's zero.",
                        "<strong>Initialization</strong>: Actually putting a value in the box. In C: <code>age = 25;</code>. Now the box has a known, useful value.",
                        "<strong>Definition</strong>: Declaration and initialization in one step — the normal way to do it. In C: <code>int age = 25;</code>. Always prefer this. Reading an uninitialized variable is undefined behavior, meaning C gives itself permission to do literally anything — crash, return garbage, or silently produce wrong answers."
                    ]
                },
                {
                    title: "Primary Data Types",
                    content: "C has a handful of built-in types. Each one tells the compiler how many bytes to reserve and how to interpret those bytes. Choosing the right type isn't just about correctness — it affects memory usage, performance, and whether your math will be accurate.",
                    code: `#include <stdio.h>

int main() {
    // Integer: Whole numbers (positive or negative)
    int age = 25;
    
    // Float: Decimal numbers (approx 6-7 digits precision)
    float temperature = 98.6;
    
    // Double: Larger decimal numbers (approx 15 digits precision)
    double pi = 3.14159265358979;
    
    // Char: A single character (enclosed in single quotes)
    char grade = 'A';
    
    printf("Age: %d\\n", age);
    printf("Temp: %.1f\\n", temperature);
    printf("Pi: %.14f\\n", pi);
    printf("Grade: %c\\n", grade);
    
    return 0;
}`,
                    output: "Age: 25\nTemp: 98.6\nPi: 3.14159265358979\nGrade: A"
                },
                {
                    title: "Type Sizes and Why They Matter",
                    content: "Different types use different amounts of memory, which directly controls what values they can hold. Running out of a type's range doesn't crash your program — it just silently wraps around to a completely wrong value. This is called overflow, and it's one of C's most beloved silent killers.",
                    points: [
                        "<code>char</code>: 1 byte. Can store a small number (-128 to 127) or, more usefully, an ASCII character. 'A' is stored as 65. They're literally the same thing at the byte level.",
                        "<code>int</code>: Usually 4 bytes. Can hold values from roughly -2.1 billion to +2.1 billion. If you need something outside that range, you need a different type (<code>long</code> or <code>long long</code>).",
                        "<code>float</code>: 4 bytes. Stores decimal numbers with about 6-7 significant digits of precision. Fine for most everyday use, but not for financial calculations or anything where small rounding errors compound.",
                        "<code>double</code>: 8 bytes. 'Double precision' float with about 15-16 significant digits. When in doubt between <code>float</code> and <code>double</code>, use <code>double</code>. The extra 4 bytes are almost always worth it."
                    ],
                    warning: "Using the wrong format specifier (e.g., <code>%d</code> for a float) produces garbage output and is technically undefined behavior. The computer reads the raw bytes of your float and interprets them as an integer — the result is some random-looking number. Always match your format specifiers to your variable types."
                },
                {
                    title: "Numeric Literals: Decimal, Hex, Octal, and Binary",
                    content: "When you write a number directly in your code, it's called a numeric literal. By default C interprets it as decimal (base 10), which is what you'd expect. But C also supports other number bases using special prefixes — and one of them has a trap you absolutely need to know about.",
                    points: [
                        "<strong>Decimal (base 10)</strong>: Normal numbers. <code>int x = 42;</code>. No prefix. This is the default.",
                        "<strong>Hexadecimal (base 16)</strong>: Prefix <code>0x</code> or <code>0X</code>. Digits are 0–9 and A–F. <code>int x = 0xFF;</code> is 255 in decimal. Used constantly for bit masks, memory addresses, and color values. Print with <code>%x</code> or <code>%X</code>.",
                        "<strong>Octal (base 8)</strong>: Prefix <code>0</code> (just a leading zero). <code>int x = 017;</code> is 15 in decimal. This is the trap. If you try to pad a decimal number with leading zeros to make it line up visually — like <code>int x = 0099;</code> — you'll get a compiler error because 9 isn't a valid octal digit. And <code>int x = 0077;</code> compiles fine but gives you 63, not 77.",
                        "<strong>Binary (base 2)</strong>: Prefix <code>0b</code> or <code>0B</code>. <code>int x = 0b1010;</code> is 10 in decimal. This was added in C23 and is supported as an extension by GCC and Clang even for older standards."
                    ],
                    code: `#include <stdio.h>

int main() {
    int dec = 255;    // Decimal
    int hex = 0xFF;   // Hexadecimal: same value
    int oct = 0377;   // Octal: same value
    int bin = 0b11111111; // Binary: same value (C23/GCC extension)
    
    printf("Decimal:     %d\\n", dec); // 255
    printf("Hex:         %d\\n", hex); // 255
    printf("Octal:       %d\\n", oct); // 255
    printf("Binary:      %d\\n", bin); // 255
    
    // Print in different bases
    printf("\\n255 in hex:  0x%X\\n", 255); // 0xFF
    printf("255 in octal: 0%o\\n",  255); // 0377
    
    // THE OCTAL TRAP
    int year  = 2024;  // Fine: decimal 2024
    int wrong = 0144;  // Looks like 144 but it's OCTAL: = 100 decimal!
    printf("\\nOctal trap: 0144 = %d in decimal\\n", wrong); // 100
    
    return 0;
}`,
                    output: "Decimal:     255\nHex:         255\nOctal:       255\nBinary:      255\n\n255 in hex:  0xFF\n255 in octal: 0377\n\nOctal trap: 0144 = 100 in decimal",
                    warning: "The octal trap is real and subtle. Any integer literal with a leading zero is octal, not decimal. <code>int pin = 0123;</code> looks like the number 123 but is actually 83. This has caused bugs in real software — particularly in Unix file permission masks like <code>chmod(path, 0755)</code>, where the leading zero is intentional. Never pad decimal numbers with leading zeros."
                },
                {
                    title: "Naming Rules",
                    content: "Variable names in C follow strict rules. Break them and the compiler won't budge. Follow them but name things poorly and future-you will be confused in two weeks.",
                    points: [
                        "Must start with a letter (A–Z, a–z) or an underscore. Numbers cannot be first.",
                        "After the first character, letters, digits (0–9), and underscores are all fair game.",
                        "Case-sensitive: <code>Score</code>, <code>score</code>, and <code>SCORE</code> are three completely separate variables. This has caused real production bugs.",
                        "Cannot use C's reserved keywords as names. You can't name a variable <code>int</code>, <code>return</code>, <code>if</code>, etc. The compiler will be very upset.",
                        "Best Practice: Use descriptive names. <code>user_age</code> is infinitely better than <code>x</code>. You may think you'll remember what <code>x</code> means tomorrow. You won't."
                    ]
                }
            ]
        },
        {
            id: "booleans",
            title: "Boolean Types",
            explanation: "A boolean is a value that is either true or false. In C's earliest days there was no dedicated boolean type — programmers used plain integers, where 0 meant false and any non-zero value meant true. C99 fixed this by adding <code>_Bool</code> as a built-in type and the <code>&lt;stdbool.h&gt;</code> header which gives you the much more readable names <code>bool</code>, <code>true</code>, and <code>false</code>. Every modern C program should use these.",
            sections: [
                {
                    title: "The Old Way vs The Right Way",
                    content: "Before C99, C programmers wrote boolean logic using plain integers. This works because C's <code>if</code>, <code>while</code>, and other control flow constructs test for zero vs non-zero — they never required a dedicated boolean type. But it means your code is littered with <code>int</code> variables named things like <code>found</code> or <code>done</code>, with no way for the compiler to enforce that you only store 0 or 1 in them.",
                    code: `#include <stdio.h>
#include <stdbool.h>  // Gives us: bool, true, false

int main() {
    // OLD WAY: int used as a boolean
    int is_raining_old = 1;  // 1 for true
    int has_umbrella_old = 0; // 0 for false
    
    // MODERN WAY: actual bool type
    bool is_raining = true;
    bool has_umbrella = false;
    
    if (is_raining && !has_umbrella) {
        printf("You're going to get wet.\\n");
    }
    
    // bool stores 1 for true, 0 for false
    printf("is_raining = %d\\n", is_raining);   // 1
    printf("has_umbrella = %d\\n", has_umbrella); // 0
    
    // Comparison operators return bool values (1 or 0)
    bool is_adult = (18 >= 18);
    printf("is_adult = %d\\n", is_adult); // 1
    
    return 0;
}`,
                    output: "You're going to get wet.\nis_raining = 1\nhas_umbrella = 0\nis_adult = 1"
                },
                {
                    title: "_Bool Without the Header",
                    content: "The actual built-in type is <code>_Bool</code>, which is available without any header. <code>bool</code>, <code>true</code>, and <code>false</code> are macros defined in <code>&lt;stdbool.h&gt;</code> that expand to <code>_Bool</code>, <code>1</code>, and <code>0</code> respectively. In C23, <code>bool</code>, <code>true</code>, and <code>false</code> became actual keywords so you no longer need the header — but for compatibility with older standards, always include it.",
                    points: [
                        "<strong><code>_Bool</code></strong>: The raw C99 boolean type. Can only hold 0 or 1. If you assign any non-zero value to it, it automatically stores 1.",
                        "<strong><code>bool</code></strong>: A macro for <code>_Bool</code> provided by <code>&lt;stdbool.h&gt;</code>. Use this name in your code — it's cleaner and universally understood.",
                        "<strong><code>true</code></strong>: A macro for <code>1</code>.",
                        "<strong><code>false</code></strong>: A macro for <code>0</code>.",
                        "<strong>Printing booleans</strong>: Use <code>%d</code> — there's no <code>%b</code> format specifier for booleans. It prints 1 or 0."
                    ],
                    code: `#include <stdio.h>
#include <stdbool.h>

// Functions can return bool
bool isEven(int n) {
    return n % 2 == 0;
}

bool isPassing(int score) {
    return score >= 60;
}

int main() {
    printf("isEven(4):       %d\\n", isEven(4));       // 1
    printf("isEven(7):       %d\\n", isEven(7));       // 0
    printf("isPassing(75):   %d\\n", isPassing(75));   // 1
    printf("isPassing(55):   %d\\n", isPassing(55));   // 0
    
    // _Bool truncates any non-zero to 1
    _Bool x = 42;   // Stored as 1, not 42
    _Bool y = -99;  // Stored as 1
    _Bool z = 0;    // Stored as 0
    printf("_Bool of 42:  %d\\n", x); // 1
    printf("_Bool of -99: %d\\n", y); // 1
    printf("_Bool of 0:   %d\\n", z); // 0
    
    return 0;
}`,
                    output: "isEven(4):       1\nisEven(7):       0\nisPassing(75):   1\nisPassing(55):   0\n_Bool of 42:  1\n_Bool of -99: 1\n_Bool of 0:   0",
                    tip: "Use <code>bool</code> for any variable that represents a yes/no, on/off, true/false state. It makes your intent immediately obvious and costs nothing — <code>bool</code> is typically 1 byte, same as <code>char</code>. Return <code>bool</code> from functions that answer yes/no questions: <code>bool isValid(...)</code>, <code>bool contains(...)</code>, <code>bool isEmpty(...)</code>."
                }
            ]
        },
        {
            id: "scanf",
            title: "Getting User Input",
            explanation: "A program that only ever prints things it already knows is barely more useful than a text file. To actually interact with a user, you need to read input. <code>scanf</code> — Scan Formatted — is C's way of reading from the keyboard. It's powerful, but it's also notorious for having subtle gotchas that trip people up for years.",
            sections: [
                {
                    title: "Basic Usage",
                    content: "The syntax mirrors <code>printf</code>: you provide a format string with specifiers, followed by the variables to store values into. The big, confusing difference: you need the <code>&</code> operator in front of each variable.",
                    code: `#include <stdio.h>

int main() {
    int number;
    
    printf("Enter a number: ");
    // &number means "the memory address of the variable 'number'"
    scanf("%d", &number);
    
    printf("You entered: %d\\n", number);
    return 0;
}`,
                    output: "Enter a number: [user types 42]\nYou entered: 42"
                },
                {
                    title: "Why the & ?",
                    tip: "This trips up nearly everyone at first. Here's the concept: in C, when you call a function and pass a variable, the function gets a copy of that value. If <code>scanf</code> only had a copy of <code>number</code>, it could fill the copy all it wants — your real variable would never change. By passing <code>&number</code> (the memory address of <code>number</code>), you're essentially handing <code>scanf</code> a map that says 'the variable lives here — go write directly into that location'. This is how C allows functions to actually modify variables that belong to the caller. You'll see this pattern constantly."
                },
                {
                    title: "Reading Different Types",
                    content: "You can read multiple values in a single <code>scanf</code> call by chaining specifiers. The user can separate them with spaces or newlines — <code>scanf</code> will skip whitespace between values automatically. One common annoyance: when reading a <code>char</code> after a previous <code>scanf</code>, there's often a leftover newline character sitting in the input buffer from when the user pressed Enter. A space before <code>%c</code> in the format string tells <code>scanf</code> to skip any whitespace first.",
                    code: `#include <stdio.h>

int main() {
    char initial;
    int age;
    
    printf("Enter your initial and age (e.g. J 25): ");
    // Note the space before %c to skip any leftover newlines
    scanf(" %c %d", &initial, &age);
    
    printf("Initial: %c, Age: %d\\n", initial, age);
    return 0;
}`,
                    output: "Enter your initial and age (e.g. J 25): [user types J 25]\nInitial: J, Age: 25"
                },
                {
                    title: "Common Pitfall: Strings",
                    content: "Reading strings with <code>scanf</code> and <code>%s</code> has a critical limitation: it stops reading at the first space. So if the user types 'John Smith', you only get 'John'. To read a whole line including spaces, use <code>fgets</code> instead. Also notice that for character arrays (strings), you do NOT use <code>&</code> — the array name itself already represents the starting memory address.",
                    warning: "Never use <code>scanf(\"%s\", buffer)</code> without a width limit like <code>scanf(\"%49s\", buffer)</code>. If the user types more characters than your array can hold, <code>scanf</code> will cheerfully write past the end of your array into whatever memory comes next. This is called a buffer overflow — it's one of the most exploited security vulnerabilities in software history, and C gives you zero protection against it by default. You are on your own."
                }
            ]
        },
        {
            id: "operators",
            title: "Operators",
            explanation: "Operators are the action symbols of C — they tell the computer to perform operations on values and variables. You already know most of them from math class, but C has a few that will surprise you, and a couple of familiar ones that behave very differently from what you'd expect.",
            sections: [
                {
                    title: "Arithmetic Operators",
                    content: "Addition, subtraction, multiplication — these all work exactly as you expect. Division and modulus, however, have behaviors that will catch you off guard the first time.",
                    code: `#include <stdio.h>

int main() {
    int a = 10, b = 3;
    
    printf("Addition: %d\\n", a + b);       // 13
    printf("Subtraction: %d\\n", a - b);    // 7
    printf("Multiplication: %d\\n", a * b); // 30
    printf("Division: %d\\n", a / b);       // 3 (Integer division truncates decimal)
    printf("Modulus: %d\\n", a % b);        // 1 (Remainder of 10 / 3)
    
    return 0;
}`,
                    output: "Addition: 13\nSubtraction: 7\nMultiplication: 30\nDivision: 3\nModulus: 1",
                    tip: "Integer division throws away the decimal part entirely — it doesn't round, it truncates. <code>10 / 3</code> is <code>3</code>, not <code>3.33</code>, not <code>4</code>. Just <code>3</code>. If you want decimal division, at least one operand must be a floating-point number: <code>10.0 / 3</code> gives you <code>3.333...</code>. The modulus operator <code>%</code> gives you the remainder after division: <code>10 % 3</code> is <code>1</code> because 10 = 3×3 + 1. It's incredibly useful for things like checking if a number is even (<code>n % 2 == 0</code>), cycling through values, and many other patterns."
                },
                {
                    title: "Assignment Operators",
                    content: "The shorthand assignment operators let you modify a variable without writing its name twice. They're common in real code and worth knowing by reflex.",
                    points: [
                        "<code>x += 5</code> means <code>x = x + 5</code>. Read it as 'add 5 to x'. This is extremely common in loops.",
                        "<code>x -= 5</code> means <code>x = x - 5</code>. 'Subtract 5 from x'.",
                        "<code>x *= 5</code> means <code>x = x * 5</code>. 'Multiply x by 5'.",
                        "<code>x /= 5</code> means <code>x = x / 5</code>. Same integer-division rules apply here — if x is an int, you still lose the decimal.",
                        "<code>x %= 5</code> means <code>x = x % 5</code>. 'Replace x with the remainder of x divided by 5'."
                    ]
                },
                {
                    title: "Integer Literal Suffixes",
                    content: "When you write a number like <code>42</code> or <code>1000000</code> in your code, the compiler gives it a type automatically — usually <code>int</code>. But sometimes you need the literal to be a specific type: an <code>unsigned int</code>, a <code>long</code>, or a <code>long long</code>. Suffixes let you specify this. They appear at the end of the number and tell the compiler exactly which type to use.",
                    points: [
                        "<code>U</code> or <code>u</code> — Unsigned: <code>42U</code> is an <code>unsigned int</code>. Use this when mixing with unsigned variables to prevent signed/unsigned comparison warnings.",
                        "<code>L</code> or <code>l</code> — Long: <code>42L</code> is a <code>long</code>. Always use uppercase <code>L</code> — lowercase <code>l</code> looks too much like the digit <code>1</code>.",
                        "<code>LL</code> or <code>ll</code> — Long Long: <code>42LL</code> is a <code>long long</code>. Needed when you want a constant that doesn't fit in a regular <code>int</code>.",
                        "<code>UL</code> — Unsigned Long: Combinations work. <code>42UL</code>, <code>42ULL</code>, etc.",
                        "<code>f</code> or <code>F</code> — Float: <code>3.14f</code> is a <code>float</code>. Without the <code>f</code>, <code>3.14</code> is a <code>double</code>. This matters for performance on embedded systems and when calling float-specific math functions."
                    ],
                    code: `#include <stdio.h>

int main() {
    // Without suffix: int (can overflow for large values!)
    // 2147483648 is INT_MAX + 1 -- overflow on 32-bit int
    // long int x = 2147483648;  // WARNING: integer overflow
    
    // With suffix: long long (guaranteed to hold large values)
    long long big = 2147483648LL;
    printf("big = %lld\\n", big); // 2147483648
    
    // Float vs double literal
    float  f1 = 3.14f;  // float literal
    double d1 = 3.14;   // double literal (default)
    printf("float:  %.10f\\n", f1); // ~3.1400001049 (float precision)
    printf("double: %.10f\\n", d1); // 3.1400000000
    
    // Left shift with suffix to avoid overflow
    // 1 << 31 is UB if 1 is int (32-bit) -- bit shifts past the sign bit
    unsigned int mask = 1U << 31; // OK: 1U is unsigned
    printf("mask = 0x%X\\n", mask); // 0x80000000
    
    return 0;
}`,
                    output: "big = 2147483648\nfloat:  3.1400001049\ndouble: 3.1400000000\nmask = 0x80000000",
                    tip: "The most practically important suffix is <code>LL</code> for large integer constants and <code>f</code> for float literals. You'll run into the <code>1U << 31</code> pattern constantly in bitwise code — always use <code>U</code> when shifting into or past the sign bit to avoid undefined behavior."
                },
                {
                    title: "Increment and Decrement",
                    content: "Adding or subtracting 1 from a variable is so common in programming (especially in loops) that C has dedicated operators for it. The difference between the prefix and postfix versions is subtle but matters in certain situations.",
                    code: `#include <stdio.h>

int main() {
    int counter = 0;
    
    counter++; // Adds 1. Counter is now 1.
    ++counter; // Adds 1. Counter is now 2.
    
    printf("Counter: %d\\n", counter);
    
    // Difference comes when used in expressions
    int a = 5;
    int b;
    
    b = a++; // Post-increment: b gets a (5), THEN a increases to 6.
    printf("a: %d, b: %d\\n", a, b);
    
    a = 5; // Reset
    b = ++a; // Pre-increment: a increases to 6, THEN b gets a (6).
    printf("a: %d, b: %d\\n", a, b);
    
    return 0;
}`,
                    output: "Counter: 2\na: 6, b: 5\na: 6, b: 6"
                },
                {
                    title: "Operator Precedence",
                    content: "When multiple operators appear in a single expression, C needs to decide which ones to evaluate first. It follows a precedence hierarchy — some operators bind tighter than others. This is exactly like PEMDAS in math: <code>2 + 3 * 4</code> is 14, not 20, because multiplication has higher precedence than addition. C has many more operators than basic math, so the hierarchy is longer — but the same principle applies.",
                    points: [
                        "<strong>Highest: <code>++</code> <code>--</code> (postfix), <code>()</code>, <code>[]</code></strong> — Function calls, array access, and postfix increment/decrement bind first.",
                        "<strong>High: <code>++</code> <code>--</code> (prefix), <code>!</code>, unary <code>-</code>, <code>*</code> (dereference), <code>&</code>, <code>sizeof</code></strong> — Unary operators applied to a single operand.",
                        "<strong>Medium-high: <code>*</code> <code>/</code> <code>%</code></strong> — Multiplication, division, modulus.",
                        "<strong>Medium: <code>+</code> <code>-</code></strong> — Addition and subtraction.",
                        "<strong>Medium-low: <code>&lt;</code> <code>&lt;=</code> <code>&gt;</code> <code>&gt;=</code></strong> — Comparison operators.",
                        "<strong>Lower: <code>==</code> <code>!=</code></strong> — Equality checks (lower than comparisons — this surprises people).",
                        "<strong>Low: <code>&&</code></strong> — Logical AND.",
                        "<strong>Lower: <code>||</code></strong> — Logical OR.",
                        "<strong>Lowest: <code>=</code> <code>+=</code> <code>-=</code> etc.</strong> — Assignment operators evaluate last, after everything on the right is resolved."
                    ],
                    code: `#include <stdio.h>

int main() {
    // Precedence example 1: * before +
    int a = 2 + 3 * 4;   // Evaluates as 2 + (3 * 4) = 14
    
    // Precedence example 2: comparison before equality
    int b = 5 > 3 == 1;  // Evaluates as (5 > 3) == 1 -> 1 == 1 -> 1 (true)
    
    // Precedence example 3: use parentheses to override
    int c = (2 + 3) * 4; // Parentheses force addition first -> 20
    
    printf("a = %d\\n", a); // 14
    printf("b = %d\\n", b); // 1
    printf("c = %d\\n", c); // 20
    
    return 0;
}`,
                    output: "a = 14\nb = 1\nc = 20",
                    tip: "You don't need to memorize the full precedence table — no one does. What you need to know is: multiplication/division before addition/subtraction, comparisons before equality checks, <code>&&</code> before <code>||</code>. For everything else, just use parentheses. They cost nothing, make intent obvious, and prevent the kind of precedence bug that wastes an hour of debugging. When in doubt, add parentheses."
                }
            ]
        },
        {
            id: "conditionals",
            title: "Conditional Statements",
            explanation: "A program that does the exact same thing every single time, regardless of input, is barely a program — it's just a very complicated print statement. Conditionals let your program make decisions: take different actions depending on the data. This is the beginning of actual logic.",
            sections: [
                {
                    title: "The 'if' Statement",
                    content: "The most fundamental decision-making tool. The condition inside the parentheses is evaluated — if it's true (any non-zero value), the block of code inside the braces runs. If it's false (zero), the block is skipped entirely.",
                    code: `#include <stdio.h>

int main() {
    int age = 20;
    
    if (age >= 18) {
        printf("You are an adult.\\n");
    }
    
    return 0;
}`,
                    output: "You are an adult."
                },
                {
                    title: "Comparison Operators",
                    content: "These operators compare two values and produce either true (1) or false (0). Simple concept, but one of them is responsible for more beginner bugs than almost anything else in C.",
                    points: [
                        "<code>==</code> Equal to. Checks if two values are the same. Note the DOUBLE equals sign.",
                        "<code>!=</code> Not equal to. True when the values are different.",
                        "<code>&gt;</code> Greater than.",
                        "<code>&lt;</code> Less than.",
                        "<code>&gt;=</code> Greater than or equal to.",
                        "<code>&lt;=</code> Less than or equal to."
                    ],
                    warning: "This deserves its own warning box: <code>=</code> is assignment. <code>==</code> is comparison. Writing <code>if (x = 5)</code> instead of <code>if (x == 5)</code> doesn't cause a compiler error — it assigns 5 to x, which evaluates to 5 (non-zero), which is always true. Your if-block runs every time, regardless of what x was. This bug is infuriating to track down. Many experienced programmers write comparisons backwards on purpose: <code>if (5 == x)</code> — that way, if you accidentally use one equals sign, the compiler will catch it (you can't assign to a literal)."
                },
                {
                    title: "if-else",
                    content: "Usually, when a condition is false, you don't just want to do nothing — you want to do something else. The <code>else</code> block handles the 'condition was false' case. Only one of the two blocks ever runs — it's one or the other, never both.",
                    code: `#include <stdio.h>

int main() {
    int score = 55;
    
    if (score >= 60) {
        printf("Pass\\n");
    } else {
        printf("Fail\\n");
    }
    return 0;
}`,
                    output: "Fail"
                },
                {
                    title: "Logical Operators",
                    content: "Real conditions are often more complex than a single comparison. Logical operators let you combine multiple conditions into one.",
                    points: [
                        "<code>&&</code> (AND): Both conditions on the left AND right must be true for the whole thing to be true. If the left side is false, C doesn't even bother checking the right side (this is called 'short-circuit evaluation', and it matters).",
                        "<code>||</code> (OR): At least one condition must be true. If the left side is already true, C skips checking the right side entirely.",
                        "<code>!</code> (NOT): Flips the truth value. <code>!1</code> is <code>0</code>. <code>!0</code> is <code>1</code>. Useful for making conditions more readable: <code>if (!gameOver)</code> is cleaner than <code>if (gameOver == 0)</code>."
                    ],
                    code: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int age = 25;
    bool hasLicense = true;
    
    if (age >= 18 && hasLicense) {
        printf("You can drive.\\n");
    }
    
    return 0;
}`,
                    output: "You can drive."
                },
                {
                    title: "Switch Statement",
                    content: "When you have a single variable and want to check it against a long list of specific values, a chain of <code>if-else if-else if</code> works but becomes tedious and hard to read. The <code>switch</code> statement is a cleaner alternative. It jumps directly to the matching <code>case</code> label.",
                    code: `#include <stdio.h>

int main() {
    int day = 3;
    
    switch(day) {
        case 1: printf("Monday"); break;
        case 2: printf("Tuesday"); break;
        case 3: printf("Wednesday"); break;
        default: printf("Other day");
    }
    return 0;
}`,
                    output: "Wednesday",
                    warning: "The <code>break</code> at the end of each case is not optional — it's essential. Without it, after matching <code>case 3</code> and running its code, the program doesn't stop. It 'falls through' to <code>case 4</code>, <code>case 5</code>, and so on, running all of them until it hits a <code>break</code> or reaches the end of the switch. There are rare cases where fall-through is intentional, but most of the time it's a bug. Always write the <code>break</code>. Always include a <code>default</code> case too — it handles any value that doesn't match the listed cases, and skipping it means unexpected inputs are silently ignored."
                }
            ]
        }
    ],
    
    quiz: [
        {
            question: "Which symbol is used for single-line comments?",
            options: ["##", "//", "/* */", "<!--"],
            answer: 1,
            explanation: "'//' starts a single-line comment. Everything from '//' to line end is ignored by the compiler. '/*' opens a multi-line comment. '#' starts preprocessor directives, not comments."
        },
        {
            question: "What does #include <stdio.h> do?",
            options: ["Defines a variable", "Links the standard I/O library", "Starts the program", "Prints text"],
            answer: 1,
            explanation: "#include tells the preprocessor to copy the contents of that header file into your source. stdio.h contains declarations for printf, scanf, and other I/O functions — without it, the compiler has no idea what printf is."
        },
        {
            question: "Which format specifier is used for an integer?",
            options: ["%f", "%s", "%d", "%c"],
            answer: 2,
            explanation: "%d is the format specifier for a signed decimal integer. %f is for float/double, %c for char, %s for strings."
        },
        {
            question: "What is the output of 7 / 2 in C (integers)?",
            options: ["3.5", "3", "4", "Error"],
            answer: 1,
            explanation: "Both operands are integers, so C performs integer division — the fractional part is truncated, not rounded. 7/2 = 3, not 3.5."
        },
        {
            question: "Why do we use & in scanf?",
            options: ["It looks nice", "To pass the address of the variable", "To declare a pointer", "It is optional"],
            answer: 1,
            explanation: "scanf needs the address of the variable to write into, not its value. & gives the address. Without &, you'd pass the current (garbage) value of the variable as the destination address — undefined behavior."
        },
        {
            question: "What does 'return 0' mean in main?",
            options: ["Program crashed", "Program ended successfully", "Program returned a value to be printed", "Infinite loop"],
            answer: 1,
            explanation: "return 0 from main signals successful program termination to the OS. Non-zero conventionally means an error occurred. This is how shell scripts check if a program succeeded."
        },
        {
            question: "Which operator checks for equality?",
            options: ["=", "==", "!=", "==="],
            answer: 1,
            explanation: "== is the equality comparison operator. = is assignment. This is one of the most common beginner bugs: writing if (x = 5) assigns 5 to x instead of comparing."
        },
        {
            question: "What is the value of 15 % 4?",
            options: ["3", "3.75", "0", "4"],
            answer: 0,
            explanation: "% is the modulo (remainder) operator. 15 / 4 = 3 remainder 3, so 15 % 4 = 3."
        },
        {
            question: "What header file provides the bool, true, and false keywords?",
            options: ["<stdlib.h>", "<stdbool.h>", "<types.h>", "<bool.h>"],
            answer: 1,
            explanation: "stdbool.h provides the bool type, and the true/false macros in C99-C17. In C23, bool/true/false are built-in keywords and no header is needed."
        },
        {
            question: "What is the decimal value of 0x1F in C?",
            options: ["10", "16", "31", "1F"],
            answer: 2,
            explanation: "0x means hexadecimal. 0x1F = 1*16 + 15 = 31 in decimal."
        }
    ],
    
    practice: [
        {
            title: "Personal Greeting",
            difficulty: "easy",
            problem: "Write a program that declares a character for your initial and an integer for your age, then prints them like: 'Initial: X, Age: Y'.",
            hint: "Use %c for char and %d for int.",
            solution: `#include <stdio.h>

int main() {
    char initial = 'J';
    int age = 28;
    
    printf("Initial: %c, Age: %d\\n", initial, age);
    return 0;
}`
        },
        {
            title: "Simple Calculator",
            difficulty: "easy",
            problem: "Ask the user for two integers. Print their sum, difference, and product.",
            solution: `#include <stdio.h>

int main() {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    
    printf("Sum: %d\\n", a + b);
    printf("Diff: %d\\n", a - b);
    printf("Product: %d\\n", a * b);
    
    return 0;
}`
        },
        {
            title: "Even or Odd",
            difficulty: "easy",
            problem: "Ask the user for a number. Tell them if it is Even or Odd. Use a bool variable to store the result. (Hint: use the modulus operator %).",
            hint: "Include <stdbool.h> and declare: bool isEven = (n % 2 == 0);",
            solution: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int n;
    printf("Enter a number: ");
    scanf("%d", &n);
    
    bool isEven = (n % 2 == 0);
    
    if (isEven) {
        printf("Even\\n");
    } else {
        printf("Odd\\n");
    }
    return 0;
}`
        },
        {
            title: "Grade System",
            difficulty: "medium",
            problem: "Ask for a score (0-100). Print 'A' if >= 90, 'B' if >= 80, 'C' if >= 70, 'D' if >= 60, else 'F'.",
            solution: `#include <stdio.h>

int main() {
    int score;
    printf("Enter score: ");
    scanf("%d", &score);
    
    if (score >= 90) printf("A\\n");
    else if (score >= 80) printf("B\\n");
    else if (score >= 70) printf("C\\n");
    else if (score >= 60) printf("D\\n");
    else printf("F\\n");
    
    return 0;
}`
        },
        {
            title: "Hex Converter",
            difficulty: "medium",
            problem: "Ask the user for a decimal integer. Print it in hexadecimal and octal using the correct format specifiers.",
            solution: `#include <stdio.h>

int main() {
    int n;
    printf("Enter a decimal integer: ");
    scanf("%d", &n);
    
    printf("Decimal: %d\\n", n);
    printf("Hex:     0x%X\\n", n);
    printf("Octal:   0%o\\n", n);
    
    return 0;
}`
        }
    ],
    
    exam: [
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    printf("A");
    printf("B\\n");
    printf("C");
    return 0;
}`,
            options: ["A\\nBC", "AB\\nC", "ABC\\n", "A B C"],
            answer: 1,
            explanation: "printf does not add a newline automatically. Only \\n in the second call creates a newline, so output is AB on one line, then C on the next with no trailing newline."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 10;
    int y = 3;
    printf("%d %d\\n", x / y, x % y);
    return 0;
}`,
            options: ["3 1", "3.33 1", "3 3", "4 1"],
            answer: 0,
            explanation: "Integer division 10/3 truncates to 3. The remainder 10%3 is 1."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int a = 5;
    int b = a++;
    printf("%d %d\\n", a, b);
    return 0;
}`,
            options: ["5 5", "6 5", "6 6", "5 6"],
            answer: 1,
            explanation: "Post-increment: b captures a's value (5) before a increments. After the line, a=6 and b=5."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 7;
    if (x > 5)
        printf("A\\n");
        printf("B\\n");
    return 0;
}`,
            options: ["A", "B", "A\\nB", "Nothing"],
            answer: 2,
            explanation: "Without braces, only the first printf belongs to the if. The second printf(B) is outside the if and always runs. Both print."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 1;
    switch (x) {
        case 1: printf("one ");
        case 2: printf("two ");
        default: printf("def");
    }
    return 0;
}`,
            options: ["one", "one two", "one two def", "def"],
            answer: 2,
            explanation: "No break statements — switch falls through every case once it matches. Starting at case 1, execution falls through case 2 and default."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    float f = 1 / 2;
    printf("%.1f\\n", f);
    return 0;
}`,
            options: ["0.5", "0.0", "1.0", "Compile error"],
            answer: 1,
            explanation: "1 and 2 are both integer literals, so 1/2 is integer division = 0. That 0 is then stored in f as 0.0. The cast must happen before division: (float)1/2 or 1.0/2."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int i = 0;
    while (i < 3) {
        printf("%d ", i);
        i++;
    }
    printf("%d\\n", i);
    return 0;
}`,
            options: ["0 1 2 2", "0 1 2 3", "1 2 3 3", "0 1 2"],
            answer: 1,
            explanation: "Loop runs for i=0,1,2, printing each. After the loop exits (when i=3), printf prints 3."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    char c = 'A';
    printf("%c %d\\n", c, c);
    return 0;
}`,
            options: ["A A", "A 65", "65 A", "65 65"],
            answer: 1,
            explanation: "%c prints the character 'A'. %d prints its ASCII integer value, which is 65. A char is just a small integer — both formats are valid."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 5;
    int y = 10;
    int z = x > 3 && y < 5;
    printf("%d\\n", z);
    return 0;
}`,
            options: ["1", "0", "5", "10"],
            answer: 1,
            explanation: "x > 3 is true (1). y < 5 is false (0). true && false = 0. z is assigned 0."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 0xFF;
    printf("%d\\n", x);
    return 0;
}`,
            options: ["FF", "255", "256", "0xFF"],
            answer: 1,
            explanation: "0xFF is a hexadecimal literal. F=15, so 0xFF = 15*16 + 15 = 255. %d prints it as a decimal integer."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    printf("%d\\n", 2 + 3 * 4);
    printf("%d\\n", (2 + 3) * 4);
    return 0;
}`,
            options: ["14 then 14", "20 then 20", "14 then 20", "20 then 14"],
            answer: 2,
            explanation: "Operator precedence: * before +. 2 + 3*4 = 2+12 = 14. With parentheses: (2+3)*4 = 5*4 = 20."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int a = 5, b = 10;
    if (a = b) {
        printf("equal\\n");
    } else {
        printf("not equal\\n");
    }
    return 0;
}`,
            options: ["equal", "not equal", "Compile error", "Nothing"],
            answer: 0,
            explanation: "a = b is ASSIGNMENT, not comparison. It assigns 10 to a, then the if tests whether 10 is truthy — it is (non-zero), so 'equal' prints. This is a classic bug; == was intended."
        }
    ],
};

window.ModuleBeginner = ModuleBeginner;