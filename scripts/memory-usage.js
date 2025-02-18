import { PostgresMock } from '../dist/main.cjs'

async function runMemoryTest() {
    console.log('Initial memory:', process.memoryUsage());
    
    const mock = await PostgresMock.create();
    console.log('After create:', process.memoryUsage());
    
    await mock.destroy();
    console.log('After destroy:', process.memoryUsage());
    
    if (global.gc) {
        global.gc();
        console.log('After GC:', process.memoryUsage());
    }

    process.exit(0)
}

runMemoryTest().catch(console.error);