// D:\vscodedata\codebuddy\features\webContainers\components\webcontainer-preview.tsx

"use client"

import { WebContainer } from '@webcontainer/api';
import { TemplateFolder } from '@/features/playground/lib/path-to-json';
import React, { useEffect, useCallback, useState, useRef } from 'react'
import { transformToWebContainerFormat } from '../hooks/transformer';
import { CheckCircle, Loader2, Terminal, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { set } from 'zod';
import { ca } from 'date-fns/locale';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
//import TerminalComponent from './terminal';
import dynamic from 'next/dynamic'
import TerminalAiTabs from '@/components/playground/terminal-ai-tabs';

const TerminalComponent = dynamic(
  () => import('./terminal'), // Adjust the path if needed
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading terminal...</p>
        </div>
      </div>
    )
  }
)

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  isLoading: boolean;
  error: Error | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean;
  playgroundId?: string;
  editorContent?: string;
  onInsertCode?: (code: string) => void;
  onRunCode?: () => void;
  onCreateFile?: (filename: string, content: string) => Promise<void>;
  onCreateFolder?: (folderName: string) => Promise<void>;
}
const WebContainerPreview = ({
  templateData,
  serverUrl,
  isLoading,
  error,
  instance,
  writeFileSync,
  forceResetup = false,
  playgroundId = '',
  editorContent = '',
  onInsertCode,
  onRunCode,
  onCreateFile,
  onCreateFolder
}: WebContainerPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const totalSteps = 4;
  const [setupError, setSetupError] = useState<Error | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingState, setLoadingState] = useState({
    transforming: false,
    mounting: false,
    installing: false,
    starting: false,
    ready: false,
  });

  const terminalRef = useRef<any>(null)

  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupComplete(false);
      setPreviewUrl("");
      setCurrentStep(0);
      setLoadingState({
        transforming: false,
        mounting: false,
        installing: false,
        starting: false,
        ready: false,
      });
    }
  }, [forceResetup]);

  useEffect(() => {
    async function setupWebContainer() {
      // Don't setup if already complete or in progress
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);

        try {
          if (forceResetup) {
            // Clear any existing listeners
            // Note: WebContainer doesn't have removeAllListeners, but we can handle this differently
            console.log('Force resetup requested');
          }
          const packageJsonExists = await instance.fs.readFile('package.json').catch(() => null);
          if (packageJsonExists) {
            // implement here terminal related stuff
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal('Reconnecting to existing WebContainer session...\r\n');
            }
          }

          // Step 1: Transforming data
          setCurrentStep(1);
          setLoadingState((prev) => ({ ...prev, starting: true }));

          // Terminal related stuff
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal('Transforming template data...\r\n');
          }

          // Add null check for templateData
          if (!templateData) {
            throw new Error('Template data is not available');
          }

          const files = transformToWebContainerFormat(templateData);
          setLoadingState((prev) => ({ ...prev, transforming: false, mounting: true }));
          setCurrentStep(2);

          // terminal related stuff
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal('Mounting files to WebContainer...\r\n');
          }

          // Add proper dimensions handling
          if (instance && typeof instance.mount === 'function') {
            await instance.mount(files);
          } else {
            // Fallback for dimension issues
            console.warn('Mount method not available, using alternative approach');
            // You might want to implement a different mounting strategy here
          }

          setLoadingState((prev) => ({
            ...prev,
            mounting: false,
            installing: true,
          }));
          setCurrentStep(3);

          // terminal stuff
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal('Installing dependencies...\r\n');
          }

          const installProcess = await instance.spawn('npm', ['install']);

          if (installProcess && installProcess.output) {
            installProcess.output.pipeTo(
              new WritableStream({
                write: (data) => {
                  // write directly to terminal
                  if (terminalRef.current?.writeToTerminal) {
                    terminalRef.current.writeToTerminal(data);
                  }
                }
              })
            );
          } else {
            console.warn('Install process output not available');
          }

          const installExitCode = await installProcess.exit;
          if (installExitCode !== 0) {
            throw new Error(`Failed to install dependencies, exit code: ${installExitCode}`);
          }

          // terminal stuff
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal('Dependencies installed successfully\r\n');
          }

          setLoadingState((prev) => ({
            ...prev,
            installing: false,
            starting: true,
          }));
          setCurrentStep(4);

          const startProcess = await instance.spawn('npm', ['run', 'start']);

          // Listen for server ready event
          instance.on("server-ready", (port: number, url: string) => {
            console.log(`Server ready on port ${port} at ${url}`);
            // Terminal stuff
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(`Server ready at ${url}\r\n`);
            }
            setPreviewUrl(url);
            setLoadingState((prev) => ({
              ...prev,
              starting: false,
              ready: true,
            }));
            setIsSetupComplete(true);
            setIsSetupInProgress(false);
          });

          // Handle start process output - stream to terminal
          if (startProcess && startProcess.output) {
            startProcess.output.pipeTo(
              new WritableStream({
                write: (data) => {
                  if (terminalRef.current?.writeToTerminal) {
                    terminalRef.current.writeToTerminal(data);
                  }
                }
              })
            );
          } else {
            console.warn('Start process output not available');
          }

        } catch (err) {
          console.error('Error checking existing session:', err);
        }

      } catch (err) {
        console.error('Error setting up container:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`Error: ${errorMessage}\r\n`);
        }

        setSetupError(new Error(errorMessage));
        setIsSetupInProgress(false);
        setLoadingState({
          transforming: false,
          mounting: false,
          installing: false,
          starting: false,
          ready: false,
        });
      }
    }
    setupWebContainer()
  },
    [instance, templateData, isSetupComplete, isSetupInProgress])
  // cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // don't kill process or cleanup when component unmounts
      // The WebContainer should persist acress component re-mounts
    };
  }, []);
  if (isLoading) {
    <div className='h-full flex items-center justify-center'>
      <div className='text-center space-y-4 max-w p-6 rounded-lg bg-gray-50 dark:bg-gray-900'>
        <Loader2 className='h-10 w-10 animate-spin text-primary mx-auto' />
        <h3 className='text-lg font-medium'>Initializing WebContainer</h3>
        <p className='text-sm text-gray-500 dark:test-gray-400'> Setting up the environment for your project... </p>
      </div>
    </div>
  }

  if (error || setupError) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-md'>
          <div className='flex items-center gap-2 mb-3'>
            <XCircle className='h-5 w-5'></XCircle>
            <h3 className='font-semibold'>Error</h3>
          </div>
          <p className='text-sm'>{error ? error.message : setupError?.message}</p>
        </div>
      </div>
    )
  };

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return <CheckCircle className='h-5 w-5 text-green-500' />
    }
    else if (stepIndex === currentStep) {
      return <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
    }
    else {
      return <div className='h-5 w-5 rounded-full border-2 border-gray-300'></div>
    }
  };

  const getStepText = (stepIndex: number, Label: string) => {
    const isActive = stepIndex === currentStep;
    const isComplete = stepIndex < currentStep;

    return (
      <span className={`text-sm font-medium ${isComplete ? `text-green-600` :
        isActive ? `text-blue-600` :
          `text-gray-500`
        }`}> {Label}</span>
    );
  }
  return (
    <div className='h-full w-full flex flex-col'>
      {
        !previewUrl ? (
          <div className="h-full flex flex-col">
            <div className='h-full max-w-md p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-sm mx-auto'>
              <h3 className='text-lg font-medium mb-4'>Setting up your environment</h3>
              <Progress value={(currentStep / totalSteps) * 100} className='h-2 mb-6' />
              <div className='flex items-center gap-3'>
                {getStepIcon(1)}
                {getStepText(1, 'Transforming template data')}
              </div>
              <div className='flex items-center gap-3'>
                {getStepIcon(2)}
                {getStepText(2, 'Mounting files')}
              </div>
              <div className='flex items-center gap-3'>
                {getStepIcon(3)}
                {getStepText(3, 'Installing dependencies')}
              </div>
              <div className='flex items-center gap-3'>
                {getStepIcon(4)}
                {getStepText(4, 'Starting server')}
              </div>
            </div>
            <div className='flex-1 p-4'>
              <TerminalComponent ref={terminalRef} webContainerInstance={instance} theme='dark' className='h-full' />
            </div>
          </div>
        ) : (
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <iframe
                src={previewUrl}
                className='w-full h-full border-none'
                title='WebContainer Preview'
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={40}>
              <TerminalAiTabs
                playgroundId={playgroundId}
                editorContent={editorContent}
                webContainerInstance={instance}
                onInsertCode={onInsertCode}
                onRunCode={onRunCode}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )
      }
    </div>
  );

}

export default WebContainerPreview
