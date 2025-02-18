const teardown = async () => {
    const logMemory = (label) => {
        const heap = process.memoryUsage();
        console.log(`\nMemory usage (${label}):`, {
            heapUsed: Math.round(heap.heapUsed / 1024 / 1024) + 'MB',
            heapTotal: Math.round(heap.heapTotal / 1024 / 1024) + 'MB',
            external: Math.round(heap.external / 1024 / 1024) + 'MB',
            arrayBuffers: Math.round(heap.arrayBuffers / 1024 / 1024) + 'MB'
        });
    };

    console.log('\nStarting teardown...');
    logMemory('initial');
    
    // Multiple GC passes
    if (global.gc) {
        for (let i = 0; i < 3; i++) {
            global.gc();
            await new Promise(resolve => setTimeout(resolve, 100));
            logMemory(`gc pass ${i + 1}`);
        }
    }

    // Try to clear WebAssembly memory
    const handles = process._getActiveHandles();
    handles.forEach(handle => {
        if (handle.buffer) handle.buffer = null;
        if ('destroy' in handle) handle.destroy();
    });

    // Final cleanup
    if (global.gc) {
        global.gc();
        logMemory('final');
    }
};

export default teardown;