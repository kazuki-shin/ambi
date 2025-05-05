import tracer from "dd-trace";
tracer.init({
  // Optional: Enable runtime metrics, profiling, log injection, etc.
  // logInjection: true, 
  // profiling: true,
  // runtimeMetrics: true,
}); // initialized in a different file to avoid hoisting.
export default tracer; 