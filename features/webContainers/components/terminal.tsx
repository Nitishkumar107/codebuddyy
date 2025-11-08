// D:\vscodedata\codebuddy\features\webContainers\components\terminal.tsx


"use client"

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import { SearchAddon } from "xterm-addon-search"
import "xterm/css/xterm.css"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Copy, Trash2, Download, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"



interface TerminalProps {
    webcontainerUrl?: string;
    className?: string;
    theme?: "dark" | "light";
    webContainerInstance?: any;
}

export interface TerminalRef {
    writeToTerminal: (data: string) => void
    clearTerminal: () => void;
    focusTerminal: () => void;
}

const TerminalComponent = forwardRef<TerminalRef, TerminalProps>(({
    webcontainerUrl,
    className,
    theme = "dark",
    webContainerInstance
}, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    const searchAddon = useRef<SearchAddon | null>(null);
    const [isConnected, setIsConnected] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [showSearch, setShowSearch] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
    const [currentDirectory, setCurrentDirectory] = useState("/home/user");
    const [plugins, setPlugins] = useState<Record<string, any>>({});
    const [sessionData, setSessionData] = useState<any>(null);

    // command line state
    const currentLine = useRef<string>("");
    const cursorPosition = useRef<number>(0);
    const commandHistory = useRef<string[]>([]);
    const historyIndex = useRef<number>(-1);
    const multiLineBuffer = useRef<string[]>([]);
    const isMultiLine = useRef<boolean>(false);



    const terminalThemes = {
        dark: {
            background: "#0D1117",
            foreground: "#E6EDF3",
            cursor: "#E6EDF3",
            cursorAccent: "#0D1117",
            selection: "#3E4451",
            black: "#0D1117",
            red: "#F85149",
            green: "#56D364",
            yellow: "#FAB005",
            blue: "#58A6FF",
            magenta: "#A371F7",
            cyan: "#39C5CF",
            white: "#B1B1B1",
            brightBlack: "#636E7B",
            brightRed: "#FF6E6E",
            brightGreen: "#85E085",
            brightYellow: "#FEC140",
            brightBlue: "#70B4FF",
            brightMagenta: "#C18CF2",
            brightCyan: "#45D4E0",
            brightWhite: "#FFFFFF"
        },
        light: {
            background: "#FFFFFF",
            foreground: "#181818",
            cursor: "#181818",
            cursorAccent: "#FFFFFF",
            selection: "#E4E4E7",
            black: "#000000",
            red: "#D70000",
            green: "#008700",
            yellow: "#FF8700",
            blue: "#0087FF",
            magenta: "#870087",
            cyan: "#008787",
            white: "#FFFFFF",
            brightBlack: "#444444",
            brightRed: "#FF0000",
            brightGreen: "#00FF00",
            brightYellow: "#FFFF00",
            brightBlue: "#0000FF",
            brightMagenta: "#FF00FF",
            brightCyan: "#00FFFF",
            brightWhite: "#FFFFFF"
        },
        blue: {
            background: "#001f3f",
            foreground: "#ffffff",
            cursor: "#0074D9",
            cursorAccent: "#001f3f",
            selection: "#0074D9",
            black: "#000000",
            red: "#FF4136",
            green: "#2ECC40",
            yellow: "#FFDC00",
            blue: "#0074D9",
            magenta: "#B10DC9",
            cyan: "#7FDBFF",
            white: "#DDDDDD",
            brightBlack: "#111111",
            brightRed: "#FF4136",
            brightGreen: "#2ECC40",
            brightYellow: "#FFDC00",
            brightBlue: "#0074D9",
            brightMagenta: "#B10DC9",
            brightCyan: "#7FDBFF",
            brightWhite: "#FFFFFF"
        },
        green: {
            background: "#003300",
            foreground: "#ffffff",
            cursor: "#00ff00",
            cursorAccent: "#003300",
            selection: "#006600",
            black: "#000000",
            red: "#ff0000",
            green: "#00ff00",
            yellow: "#ffff00",
            blue: "#0000ff",
            magenta: "#ff00ff",
            cyan: "#00ffff",
            white: "#ffffff",
            brightBlack: "#333333",
            brightRed: "#ff3333",
            brightGreen: "#33ff33",
            brightYellow: "#ffff33",
            brightBlue: "#3333ff",
            brightMagenta: "#ff33ff",
            brightCyan: "#33ffff",
            brightWhite: "#ffffff"
        }
    };

    // Available commands
    const availableCommands = [
        'clear', 'help', 'theme', 'ls', 'pwd', 'whoami', 'echo', 'cat', 'mkdir', 'rm', 'cp', 'mv',
        'ps', 'kill', 'ping', 'curl', 'git', 'npm', 'python', 'node', 'history', 'system', 'uptime',
        'weather', 'plugins', 'save-session', 'load-session'
    ];

    // Initialize terminal
    const initTerminal = useCallback(() => {
        if (!terminalRef.current) return;

        // Initialize terminal
        const terminal = new Terminal({
            rows: 24,
            cols: 80,
            theme: terminalThemes[isDarkMode ? 'dark' : 'light'],
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: 14,
            cursorBlink: true,
            scrollback: 10000
        });

        term.current = terminal;
        
        // Initialize addons
        fitAddon.current = new FitAddon();
        searchAddon.current = new SearchAddon();
        
        // Attach addons
        terminal.loadAddon(fitAddon.current);
        terminal.loadAddon(searchAddon.current);
        terminal.loadAddon(new WebLinksAddon());
        
        // Open terminal
        terminal.open(terminalRef.current);
        
        // Fit terminal to container
        fitAddon.current.fit();
        
        // Set up event listeners
        terminal.onData(handleTerminalInput);
        
        // Initial prompt
        writePrompt();
        
        // Load session if exists
        loadSession();
        
        // Cleanup
        return () => {
            terminal.dispose();
        };
    }, [isDarkMode]);

    const writePrompt = useCallback(() => {
        if (term.current) {
            term.current.write(`\r\n${currentDirectory}$ `);
            currentLine.current = "";
            cursorPosition.current = 0;
        }
    }, [currentDirectory]);

    const clearTerminal = useCallback(() => {
        if (term.current) {
            term.current.clear();
            writePrompt();
        }
    }, [writePrompt]);

    // Enhanced command history navigation
    const navigateHistory = useCallback((direction: 'up' | 'down') => {
        if (commandHistory.current.length === 0) return;
        
        if (direction === 'up') {
            if (historyIndex.current < commandHistory.current.length - 1) {
                historyIndex.current++;
                const command = commandHistory.current[commandHistory.current.length - 1 - historyIndex.current];
                currentLine.current = command;
                cursorPosition.current = command.length;
                // Clear current line and write new one
                if (term.current) {
                    term.current.write('\r' + ' '.repeat(100) + '\r');
                    term.current.write(`${currentDirectory}$ ${command}`);
                }
            }
        } else {
            if (historyIndex.current > 0) {
                historyIndex.current--;
                const command = commandHistory.current[commandHistory.current.length - 1 - historyIndex.current];
                currentLine.current = command;
                cursorPosition.current = command.length;
                if (term.current) {
                    term.current.write('\r' + ' '.repeat(100) + '\r');
                    term.current.write(`${currentDirectory}$ ${command}`);
                }
            } else {
                historyIndex.current = -1;
                currentLine.current = "";
                cursorPosition.current = 0;
                if (term.current) {
                    term.current.write('\r' + ' '.repeat(100) + '\r');
                    term.current.write(`${currentDirectory}$ `);
                }
            }
        }
    }, [currentDirectory]);

    // Tab completion
    const handleTabCompletion = useCallback(() => {
        const matches = availableCommands.filter(cmd => cmd.startsWith(currentLine.current));
        
        if (matches.length === 1) {
            currentLine.current = matches[0];
            cursorPosition.current = matches[0].length;
            if (term.current) {
                term.current.write('\r' + ' '.repeat(100) + '\r');
                term.current.write(`${currentDirectory}$ ${matches[0]}`);
            }
        } else if (matches.length > 1) {
            if (term.current) {
                term.current.write(`\r\n${matches.join('  ')}\r\n`);
                writePrompt();
            }
        }
    }, [currentDirectory]);

    // File system integration
    const executeFileCommands = useCallback(async (command: string) => {
        if (!term.current) return;
        
        if (command.startsWith('cat ')) {
            const filename = command.substring(4).trim();
            try {
                // Simulate file reading
                if (filename === 'README.md') {
                    term.current.write('\r\n# Welcome to WebContainer Terminal\r\n');
                    term.current.write('This is a powerful terminal emulator with advanced features.\r\n');
                } else if (filename === 'package.json') {
                    term.current.write('\r\n{\r\n  "name": "webcontainer-terminal",\r\n  "version": "1.0.0"\r\n}\r\n');
                } else {
                    term.current.write(`\r\nError: No such file: ${filename}\r\n`);
                }
            } catch (error) {
                term.current.write(`\r\nError reading file: ${error}\r\n`);
            }
        } else if (command.startsWith('echo ')) {
            const content = command.substring(5);
            term.current.write(`\r\n${content}\r\n`);
        } else if (command.startsWith('mkdir ')) {
            const dirname = command.substring(6).trim();
            term.current.write(`\r\nDirectory created: ${dirname}\r\n`);
        } else if (command.startsWith('rm ')) {
            const filename = command.substring(3).trim();
            term.current.write(`\r\nFile removed: ${filename}\r\n`);
        }
    }, []);

    // Process management
    const executeProcessCommands = useCallback((command: string) => {
        if (!term.current) return;
        
        if (command === 'ps') {
            term.current.write('\r\nPID   COMMAND\r\n');
            term.current.write('1     bash\r\n');
            term.current.write('2     node server.js\r\n');
            term.current.write('3     npm start\r\n');
        } else if (command.startsWith('kill ')) {
            const pid = command.substring(5);
            term.current.write(`\r\nProcess ${pid} terminated\r\n`);
        }
    }, []);

    // Performance monitoring
    const showPerformance = useCallback(() => {
        if (!term.current) return;
        
        term.current.write('\r\nSystem Status:\r\n');
        term.current.write(`CPU: ${(Math.random() * 100).toFixed(1)}%\r\n`);
        term.current.write(`Memory: ${(Math.random() * 100).toFixed(1)}%\r\n`);
        term.current.write(`Uptime: ${Math.floor(Math.random() * 1000)}s\r\n`);
    }, []);

    // Network integration
    const executeNetworkCommands = useCallback((command: string) => {
        if (!term.current) return;
        
        if (command.startsWith('ping ')) {
            const host = command.substring(5);
            term.current.write(`\r\nPING ${host} (127.0.0.1) 56(84) bytes of data.\r\n`);
            term.current.write(`64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.034 ms\r\n`);
            term.current.write(`64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.029 ms\r\n`);
            term.current.write(`64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=0.031 ms\r\n`);
        } else if (command.startsWith('curl ')) {
            term.current.write('\r\nHTTP/1.1 200 OK\r\n');
            term.current.write('Content-Type: application/json\r\n');
            term.current.write('\r\n{"status": "success", "data": "Hello World"}\r\n');
        }
    }, []);

    // Plugin system
    const registerPlugin = useCallback((name: string, plugin: any) => {
        setPlugins(prev => ({ ...prev, [name]: plugin }));
    }, []);

    const executePluginCommand = useCallback((command: string) => {
        if (!term.current) return false;
        
        const [pluginName, ...args] = command.split(' ');
        if (plugins[pluginName]) {
            try {
                const result = plugins[pluginName](args);
                term.current.write(`\r\n${result}\r\n`);
                return true;
            } catch (error) {
                term.current.write(`\r\nPlugin error: ${error}\r\n`);
                return true;
            }
        }
        return false;
    }, [plugins]);

    // Session management
    const saveSession = useCallback(() => {
        const session = {
            history: commandHistory.current,
            currentDir: currentDirectory,
            theme: isDarkMode,
            timestamp: Date.now()
        };
        localStorage.setItem('terminal-session', JSON.stringify(session));
        if (term.current) {
            term.current.write('\r\nSession saved successfully\r\n');
        }
    }, [currentDirectory, isDarkMode]);

    const loadSession = useCallback(() => {
        const saved = localStorage.getItem('terminal-session');
        if (saved) {
            try {
                const session = JSON.parse(saved);
                setSessionData(session);
                commandHistory.current = session.history || [];
                setCurrentDirectory(session.currentDir || '/home/user');
                setIsDarkMode(session.theme || false);
                if (term.current) {
                    term.current.write('\r\nSession loaded successfully\r\n');
                }
            } catch (error) {
                if (term.current) {
                    term.current.write(`\r\nError loading session: ${error}\r\n`);
                }
            }
        }
    }, []);

    // Real-time output streaming
    const executeStreamingCommand = useCallback(async (command: string) => {
        if (!term.current) return;
        
        term.current.write(`\r\nExecuting: ${command}\r\n`);
        
        // Simulate streaming output
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            term.current.write(`\r\nProgress: ${i * 10}%`);
        }
        term.current.write(`\r\nCommand completed!\r\n`);
    }, []);

    // Main command execution
    const executeCommand = useCallback(async (command: string) => {
        if (!term.current) return;
        
        // Handle multi-line commands
        if (command.endsWith('\\')) {
            multiLineBuffer.current.push(command.slice(0, -1));
            isMultiLine.current = true;
            term.current.write('\r\n> ');
            return;
        }
        
        if (isMultiLine.current) {
            multiLineBuffer.current.push(command);
            command = multiLineBuffer.current.join(' ');
            multiLineBuffer.current = [];
            isMultiLine.current = false;
        }
        
        try {
            switch (command) {
                case 'clear':
                    clearTerminal();
                    return;
                    
                case 'help':
                    term.current.write('\r\nAvailable commands:\r\n');
                    const commands = [
                        'clear - Clear terminal screen',
                        'help - Show this help message',
                        'theme [dark|light|blue|green] - Change terminal theme',
                        'ls - List directory contents',
                        'pwd - Print working directory',
                        'whoami - Display current user',
                        'echo <text> - Display text',
                        'cat <file> - Display file contents',
                        'mkdir <dir> - Create directory',
                        'rm <file> - Remove file',
                        'ps - Show running processes',
                        'kill <pid> - Terminate process',
                        'ping <host> - Test network connectivity',
                        'curl <url> - Transfer data from URL',
                        'history - Show command history',
                        'system - Show system information',
                        'uptime - Show system uptime',
                        'plugins - List available plugins',
                        'save-session - Save current session',
                        'load-session - Load saved session'
                    ];
                    commands.forEach(cmd => term.current?.write(`\r\n  ${cmd}`));
                    term.current.write('\r\n');
                    break;
                    
                case 'ls':
                    term.current.write('\r\nREADME.md  package.json  src/  dist/  node_modules/\r\n');
                    break;
                    
                case 'pwd':
                    term.current.write(`\r\n${currentDirectory}\r\n`);
                    break;
                    
                case 'whoami':
                    term.current.write('\r\nuser\r\n');
                    break;
                    
                case 'history':
                    commandHistory.current.forEach((cmd, index) => {
                        term.current?.write(`\r\n${index + 1}  ${cmd}`);
                    });
                    term.current.write('\r\n');
                    break;
                    
                case 'system':
                    term.current.write('\r\nSystem Information:\r\n');
                    term.current.write('  OS: Linux\r\n');
                    term.current.write('  Kernel: 5.4.0\r\n');
                    term.current.write('  CPU: Intel Core i7\r\n');
                    term.current.write('  Memory: 8GB\r\n');
                    term.current.write('  Shell: bash\r\n');
                    break;
                    
                case 'uptime':
                    term.current.write(`\r\nSystem uptime: ${Math.floor(Math.random() * 100)} hours\r\n`);
                    break;
                    
                case 'plugins':
                    const pluginNames = Object.keys(plugins);
                    if (pluginNames.length > 0) {
                        term.current.write('\r\nAvailable plugins:\r\n');
                        pluginNames.forEach(plugin => term.current?.write(`\r\n  ${plugin}`));
                        term.current.write('\r\n');
                    } else {
                        term.current.write('\r\nNo plugins installed\r\n');
                    }
                    break;
                    
                case 'save-session':
                    saveSession();
                    break;
                    
                case 'load-session':
                    loadSession();
                    break;
                    
                default:
                    if (command.startsWith('theme ')) {
                        const themeName = command.split(' ')[1];
                        if (themeName && Object.keys(terminalThemes).includes(themeName)) {
                            setIsDarkMode(themeName !== 'light');
                            term.current.write(`\r\nTheme changed to ${themeName}\r\n`);
                        } else {
                            term.current.write(`\r\nUnknown theme: ${themeName}\r\n`);
                        }
                    } else if (command.startsWith('cat ') || command.startsWith('echo ') || 
                                command.startsWith('mkdir ') || command.startsWith('rm ')) {
                        executeFileCommands(command);
                    } else if (command === 'ps' || command.startsWith('kill ')) {
                        executeProcessCommands(command);
                    } else if (command === 'system' || command === 'uptime') {
                        showPerformance();
                    } else if (command.startsWith('ping ') || command.startsWith('curl ')) {
                        executeNetworkCommands(command);
                    } else if (executePluginCommand(command)) {
                        // Plugin command handled
                    } else {
                        term.current.write(`\r\nCommand not found: ${command}\r\n`);
                    }
            }
        } catch (error) {
            if (term.current) {
                term.current.write(`\r\nError: ${error}\r\n`);
            }
        }
        
        writePrompt();
    }, [clearTerminal, currentDirectory, executeFileCommands, executeProcessCommands, 
        executeNetworkCommands, executePluginCommand, saveSession, loadSession, showPerformance, writePrompt]);

    const handleTerminalInput = useCallback((data: string) => {
        if (!term.current) return;
        
        // Handle special keys
        if (data === '\r') { // Enter key
            const command = currentLine.current.trim();
            if (command) {
                commandHistory.current.push(command);
                historyIndex.current = -1;
            }
            executeCommand(command);
        } else if (data === '\u0003') { // Ctrl+C
            term.current.write('\r\n');
            writePrompt();
        } else if (data === '\u001B[A') { // Up arrow
            navigateHistory('up');
        } else if (data === '\u001B[B') { // Down arrow
            navigateHistory('down');
        } else if (data === '\t') { // Tab
            handleTabCompletion();
        } else if (data === '\u007F' || data === '\b') { // Backspace
            if (currentLine.current.length > 0) {
                currentLine.current = currentLine.current.slice(0, -1);
                cursorPosition.current = Math.max(0, cursorPosition.current - 1);
                term.current.write('\b \b');
            }
        } else {
            // Regular input
            currentLine.current += data;
            cursorPosition.current++;
            term.current.write(data);
        }
    }, [executeCommand, navigateHistory, handleTabCompletion]);

    const updateTheme = useCallback(() => {
        if (term.current) {
            term.current.options.theme = terminalThemes[isDarkMode ? 'dark' : 'light'];
        }
    }, [isDarkMode]);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    const handleSearch = useCallback(() => {
        if (searchAddon.current && term.current && searchTerm) {
            searchAddon.current.findNext(searchTerm);
        }
    }, [searchTerm]);

    const handleClear = useCallback(() => {
        clearTerminal();
    }, [clearTerminal]);

    const handleCopy = useCallback(() => {
        if (term.current) {
            const selection = term.current.getSelection();
            if (selection) {
                navigator.clipboard.writeText(selection);
            }
        }
    }, []);

    useImperativeHandle(ref, () => ({
        writeToTerminal: (data: string) => {
            if (term.current) {
                term.current.write(data);
            }
        },
        clearTerminal: () => {
            clearTerminal();
        },
        focusTerminal: () => {
            if (term.current) {
                term.current.focus();
            }
        }
    }));

    useEffect(() => {
        initTerminal();
        
        // Register sample plugins
        registerPlugin('weather', (args: string[]) => {
            const location = args[0] || 'London';
            return `Weather in ${location}: Sunny, 22°C`;
        });
        
        registerPlugin('calculator', (args: string[]) => {
            try {
                const expression = args.join(' ');
                // eslint-disable-next-line no-eval
                const result = eval(expression);
                return `Result: ${result}`;
            } catch (error) {
                return `Error: Invalid expression`;
            }
        });

        return () => {
            if (term.current) {
                term.current.dispose();
            }
        };
    }, [initTerminal, registerPlugin]);

    useEffect(() => {
        updateTheme();
    }, [isDarkMode, updateTheme]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (fitAddon.current) {
                fitAddon.current.fit();
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={cn("flex flex-col h-full w-full", className)}>
            {/* Terminal Header */}
            <div className="flex items-center justify-between p-2 bg-gray-800 text-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-sm">Terminal</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleCopy}
                        className="text-gray-300 hover:text-white"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClear}
                        className="text-gray-300 hover:text-white"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleTheme}
                        className="text-gray-300 hover:text-white"
                    >
                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
                <div className="flex items-center p-2 bg-gray-700">
                    <Search className="h-4 w-4 text-gray-300 mr-2" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="flex-1 bg-gray-600 text-gray-200 border-gray-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowSearch(false)}
                        className="text-gray-300 hover:text-white ml-2"
                    >
                        Close
                    </Button>
                </div>
            )}

            {/* Terminal Content */}
            <div 
                ref={terminalRef} 
                className="flex-1 overflow-hidden relative"
            />

            {/* Terminal Footer */}
            <div className="flex items-center justify-between p-2 bg-gray-800 text-gray-400 text-xs">
                <div className="flex items-center space-x-4">
                    <span>Rows: {term.current?.rows || 0}</span>
                    <span>Columns: {term.current?.cols || 0}</span>
                    <span>Theme: {isDarkMode ? 'dark' : 'light'}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowSearch(true)}
                        className="text-gray-300 hover:text-white"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            if (term.current) {
                                const data = term.current.getSelection();
                                if (data) {
                                    navigator.clipboard.writeText(data);
                                }
                            }
                        }}
                        className="text-gray-300 hover:text-white"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default TerminalComponent;
