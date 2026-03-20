const ModuleZero = {
    description: "The very beginning: what is programming, how computers think, what compilers do, and where C came from. Start here if you've never programmed before.",
    
    lessons: [
        {
            id: "what-is-programming",
            title: "What is a Programming Language?",
            explanation: "A programming language is a set of instructions you write to tell a computer what to do. But here's the catch: computers don't understand English, Python, C, or any language the way humans do. They only understand electricity — on or off, 1 or 0. A programming language bridges that gap.",
            sections: [
                {
                    title: "The Translation Chain",
                    content: "When you write code in C (or any language), you're writing in a form that humans can read and reason about. But the computer can't execute that directly. The code has to go through a conversion process — either compiled or interpreted — to become machine instructions that the CPU can actually execute. Think of it like writing a letter in English and hiring a translator to convert it to Mandarin.",
                    points: [
                        "<strong>High-level languages (human-readable)</strong>: C, Python, Java, JavaScript — these are designed to be understandable by humans. They use words and syntax that make sense to us.",
                        "<strong>Low-level languages (machine-readable)</strong>: Assembly, machine code — these are what the CPU actually runs. They look like `mov eax, 1` or `10110110 01100001` depending on how you represent them.",
                        "<strong>The translation layer</strong>: Compilers and interpreters sit between these two worlds. They take human-readable code and produce machine code."
                    ]
                },
                {
                    title: "Why Have Programming Languages At All?",
                    content: "You could theoretically write code directly in machine code, using 1s and 0s. Many early programmers actually did this. Modern programmers stopped because their productivity dropped roughly 99%. Programming languages exist to make it physically possible for humans to think about complex problems without losing their minds in a sea of binary digits.",
                    points: [
                        "<strong>Abstraction</strong>: A programming language lets you write `sum = a + b` instead of manually manipulating CPU registers and memory addresses.",
                        "<strong>Readability</strong>: Code written 6 months ago by someone else should be somewhat understandable. Machine code is not.",
                        "<strong>Portability</strong>: Code written in C can be compiled on Windows, Linux, macOS, and countless other systems. Machine code for Intel is completely different from machine code for ARM."
                    ]
                },
                {
                    title: "Where Does C Fit?",
                    content: "C is what's called a 'mid-level' language. It's higher-level than assembly (you don't manipulate individual CPU registers directly), but lower-level than most modern languages. It sits right at that sweet spot where you still have access to memory management, hardware manipulation, and extremely efficient execution — but you can still read and write it without tearing your hair out.",
                    points: [
                        "C is one of the most portable languages ever created — code written in 1985 still compiles and runs today.",
                        "C is fast. Really fast. Operating systems, databases, and game engines are written in C because speed matters.",
                        "C is small. The language itself is relatively simple, but extremely powerful. No bloat.",
                        "C is unforgiving. It gives you rope to hang yourself with, and expects you to know how to use it safely."
                    ]
                }
            ]
        },
        {
            id: "binary-and-base2",
            title: "Why Do Computers Use Base 2?",
            explanation: "Computers only have two states: electricity on or electricity off. This fundamental physical reality shapes everything computers do. They don't naturally think in base 10 (like we do) or base 16 (like we sometimes use in programming). They think in base 2 — because it maps directly to their hardware.",
            sections: [
                {
                    title: "Base 10 vs Base 2: The Counting System",
                    content: "You probably use base 10 (decimal) every day without thinking about it. It's called 'base 10' because you have 10 digits: 0-9. In base 10, the number 247 means: 2 hundreds + 4 tens + 7 ones = 200 + 40 + 7.",
                    points: [
                        "<strong>Base 10 (decimal):</strong> Uses digits 0-9. The number 247 = 2×10² + 4×10¹ + 7×10⁰ = 200 + 40 + 7.",
                        "<strong>Base 2 (binary):</strong> Uses digits 0-1. The number 11110111 (in binary) = 1×2⁷ + 1×2⁶ + 1×2⁵ + 1×2⁴ + 0×2³ + 1×2² + 1×2¹ + 1×2⁰ = 128 + 64 + 32 + 16 + 0 + 4 + 2 + 1 = 247 (in decimal). Same number, different representation."
                    ]
                },
                {
                    title: "Why Base 2? It's All About Hardware",
                    content: "Computers use transistors — tiny electronic switches. Each transistor can be in one of two states: on (1) or off (0). To represent the number 5 in a computer, you don't use 5 transistors in the 'on' state. Instead, you use multiple transistors in specific combinations that, when read in binary, equal 5: 0101.",
                    points: [
                        "<strong>Physical mapping:</strong> A transistor OFF = binary 0. A transistor ON = binary 1. There's no middle ground.",
                        "<strong>Error resistance:</strong> If you tried to use 10 states per transistor, tiny voltage fluctuations would cause errors. With only two states, you have massive margins — 0V to 2V could be 'off', and 3V to 5V could be 'on'. Safe and reliable.",
                        "<strong>Speed:</strong> Detecting 'is this on or off?' is incredibly fast. Detecting 'which of 10 states is this in?' would be slower."
                    ]
                },
                {
                    title: "Bits, Bytes, and Practical Binary",
                    content: "A <strong>bit</strong> (binary digit) is a single 0 or 1. A <strong>byte</strong> is 8 bits grouped together. Larger units build from there, but you'll rarely think in pure binary. Instead, you'll use hexadecimal (base 16), which is just a more compact way to write binary.",
                    points: [
                        "<strong>1 bit:</strong> Can represent 2 values (0 or 1). Example: 1",
                        "<strong>1 byte (8 bits):</strong> Can represent 256 values (0-255). Example: 11110111",
                        "<strong>1 kilobyte:</strong> 1,024 bytes (not 1,000 — because 2¹⁰ = 1,024).",
                        "<strong>Hexadecimal shorthand:</strong> Because binary is verbose, we often write it in hex. 11110111 in binary = F7 in hex. Each hex digit represents exactly 4 bits, making conversion trivial."
                    ],
                    code: `// In C, you can write binary, decimal, and hexadecimal literals:
int decimal = 247;      // Regular base-10 number
int hex = 0xF7;         // Hexadecimal: 0x prefix. F7 hex = 247 decimal
int binary = 0b11110111; // Binary: 0b prefix. 11110111 binary = 247 decimal

printf("All three are the same: %d, %d, %d\\n", decimal, hex, binary);
// Output: All three are the same: 247, 247, 247`
                }
            ]
        },
        {
            id: "compilers-interpreters",
            title: "Compilers vs Interpreters: How Code Becomes Executable",
            explanation: "Your C code is just text in a file. The computer can't run text directly. Something has to convert it to machine code. That's the job of a compiler or interpreter. They're similar but work differently — and this difference shapes how each language behaves.",
            sections: [
                {
                    title: "What Does a Compiler Do?",
                    content: "A compiler reads your entire source code, analyzes it, and produces a single executable file (machine code). This happens once, before you run the program. After compilation, the executable runs independently — it doesn't need the compiler anymore.",
                    points: [
                        "<strong>Compile time:</strong> The compiler reads your code, checks for errors, optimizes it, and produces machine code. This can take a while.",
                        "<strong>Runtime:</strong> You run the executable. It's already machine code, so it runs extremely fast.",
                        "<strong>Error detection:</strong> Many errors are caught during compilation. If you try to use a variable that doesn't exist, the compiler tells you before you even run the program.",
                        "<strong>Distribution:</strong> You send the compiled executable to users. They don't need the compiler or source code."
                    ]
                },
                {
                    title: "What Does an Interpreter Do?",
                    content: "An interpreter reads your source code line by line while the program is running. As it reads each line, it checks for errors and executes it. There's no separate compilation step. This makes development faster (instant feedback) but execution slower (interpretation overhead).",
                    points: [
                        "<strong>Runtime interpretation:</strong> As the program runs, the interpreter reads and executes each line of source code.",
                        "<strong>Error detection:</strong> Errors are found while the program is running. You might write a line of code that runs fine 99% of the time, then crashes on that 1% edge case.",
                        "<strong>Development cycle:</strong> Faster to test changes. Write code, run it, see results immediately.",
                        "<strong>Distribution:</strong> You send source code to users, who need the interpreter installed to run it."
                    ]
                },
                {
                    title: "Compiler vs Interpreter: Battle of Trade-offs",
                    content: "Neither is universally superior. They represent different engineering trade-offs.",
                    points: [
                        "<strong>Compiled (C, C++, Rust):</strong> Slower development cycle, but blazingly fast execution. Small executable files that don't need external dependencies. Used for performance-critical code, operating systems, embedded systems.",
                        "<strong>Interpreted (Python, JavaScript, Ruby):</strong> Fast development cycle, immediate feedback. Slower execution. Larger memory footprint at runtime. Used for scripting, web applications, rapid prototyping.",
                        "<strong>Just-In-Time (JIT) compilation (Java, C#, some versions of JavaScript):</strong> A hybrid approach. The code is partially compiled at runtime, then executed. Attempts to get the best of both worlds."
                    ]
                },
                {
                    title: "The C Compilation Process in Detail",
                    content: "When you compile a C program, several things happen behind the scenes. You mainly need to know the conceptual flow.",
                    points: [
                        "<strong>Preprocessing:</strong> Lines starting with <code>#</code> (like <code>#include</code>) are processed. Files are included, macros are expanded.",
                        "<strong>Compilation:</strong> The preprocessed code is converted to assembly language (a human-readable form of machine code).",
                        "<strong>Assembly:</strong> Assembly is converted to machine code (actual CPU instructions).",
                        "<strong>Linking:</strong> Your code is linked with library code (like the standard library functions you use). All the references are resolved.",
                        "<strong>Result:</strong> A standalone executable file that contains everything needed to run."
                    ],
                    code: `// You compile C code like this (in a terminal):
gcc myprogram.c -o myprogram

// Behind the scenes:
// 1. gcc preprocesses myprogram.c (resolves #includes, macros)
// 2. gcc compiles it to assembly
// 3. gcc assembles it to machine code
// 4. gcc links it with required libraries
// 5. gcc outputs myprogram (executable)

// Then you run it:
./myprogram`
                }
            ]
        },
        {
            id: "history-of-c",
            title: "A Brief History of C: Why It Still Matters",
            explanation: "C didn't appear out of nowhere. It was designed to solve specific problems that programmers faced in the 1970s. Understanding its history helps explain why C works the way it does — and why it's still relevant 50 years later.",
            sections: [
                {
                    title: "The Problem: Before C",
                    content: "Before C, programming was often done in assembly language or FORTRAN. Assembly is extremely tedious — you manually manage every register and memory address. FORTRAN was high-level but had limitations and quirks. Programmers wanted something in between: easier to write than assembly, but still close enough to hardware to be efficient.",
                    points: [
                        "<strong>Assembly was everywhere:</strong> Operating systems, databases, embedded systems — all written in assembly. It was necessary because high-level languages were either too slow or too limited.",
                        "<strong>Portability nightmare:</strong> Code written on one computer might need significant rewriting to work on another computer's different processor.",
                        "<strong>Development was glacially slow:</strong> Managing memory, pointers, and hardware directly took enormous effort."
                    ]
                },
                {
                    title: "The Solution: C is Born (1972-1973)",
                    content: "Dennis Ritchie at Bell Labs created C as an evolution of a language called B (which had been created by Ken Thompson). C was elegant: small enough to understand completely, powerful enough to do anything, and simple enough to compile quickly.",
                    points: [
                        "<strong>Why 'C'?</strong> Ken Thompson's language was called 'B'. Ritchie's improvement was naturally called 'C'. (If you want to confuse people, ask them what happened to 'A'.)",
                        "<strong>The goal:</strong> A language for writing operating systems and system software. Previously, this required assembly. Ritchie wanted to raise the abstraction level without sacrificing performance.",
                        "<strong>Key features:</strong> Pointers (direct memory access), struct (organizing data), functions, simple syntax, compiled to efficient machine code."
                    ]
                },
                {
                    title: "The Big Break: Unix",
                    content: "C's killer app was Unix. Ken Thompson and Dennis Ritchie used C to rewrite Unix (previously written in assembly). Suddenly, you could move Unix from one computer to another and recompile it — no rewriting necessary. This portability was revolutionary. Unix spread everywhere. With it came C.",
                    points: [
                        "<strong>1972-1973:</strong> C is born as a language for writing operating systems.",
                        "<strong>1973-1974:</strong> The Unix kernel is written in C. Previously, operating systems were written in assembly. Before this, it was impossible to port an OS to new hardware without massive effort.",
                        "<strong>1978:</strong> Kernighan and Ritchie publish 'The C Programming Language' — the definitive reference, still used today. Often called 'K&R' by programmers.",
                        "<strong>1989:</strong> C becomes standardized (ANSI C / C89). This ensured compatibility across different compilers."
                    ]
                },
                {
                    title: "The Legacy: 50+ Years Later",
                    content: "It's 2024. C is over 50 years old. Most programming languages from that era are historical curiosities. C is still here, still widely used, still taught. Why? Because it was designed incredibly well.",
                    points: [
                        "<strong>Operating systems:</strong> iOS, Android, Linux, Windows kernels — all written in C. The entire digital world runs on C.",
                        "<strong>Embedded systems:</strong> Every microcontroller, every printer, every IoT device often has C code running inside.",
                        "<strong>Databases:</strong> MySQL, PostgreSQL, SQLite — written in C. Powering most of the web.",
                        "<strong>Speed critical code:</strong> When you need raw performance, you use C. Games, physics engines, audio processing — all rely on C.",
                        "<strong>The foundation for other languages:</strong> Python, JavaScript, Ruby interpreters are written in C. Using those languages? C is running underneath."
                    ]
                },
                {
                    title: "The Evolution: C99, C11, C17, C23",
                    content: "C hasn't stayed frozen since 1989. It evolved — carefully, keeping the original philosophy intact. New standards added useful features without breaking old code.",
                    points: [
                        "<strong>C89 (1989):</strong> First standardization. Locked down the language specification.",
                        "<strong>C99 (1999):</strong> Added features like inline functions, variable declarations in the middle of blocks, and better support for mathematics.",
                        "<strong>C11 (2011):</strong> Added multi-threading support, anonymous structs, better Unicode support.",
                        "<strong>C17 (2017):</strong> Mostly bug fixes and clarifications. The language is remarkably stable.",
                        "<strong>C23 (2023):</strong> Latest standard. Adds bitwise operations, better type support, improvements for small embedded systems."
                    ]
                },
                {
                    title: "Why Learn C in 2024?",
                    content: "You might ask: if C is old, why learn it instead of modern languages like Python or Go? Because C forces you to understand how computers actually work. It doesn't hide memory management behind garbage collection. It doesn't abstract away hardware. You learn the truth.",
                    points: [
                        "<strong>Understanding memory:</strong> When YOU manage memory (not a garbage collector), you understand how data actually lives in RAM. This makes you a better programmer in any language.",
                        "<strong>Understanding performance:</strong> C doesn't hide the cost of operations. If your code is slow, you can see why and fix it. Modern high-level languages sometimes hide that cost until you hit a wall.",
                        "<strong>Understanding systems:</strong> Once you've written C, reading an operating system kernel, a database, or a game engine becomes understandable. They're written in C.",
                        "<strong>Skill transfer:</strong> Concepts from C apply to literally every programming language. Pointers become references, memory management becomes explicit. But the fundamentals are universal."
                    ]
                }
            ]
        }
    ]
};

window.ModuleZero = ModuleZero;