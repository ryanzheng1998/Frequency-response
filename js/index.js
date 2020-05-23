// 定義參數值
let fft_size = 2048;
let axisMargin = 50;
let threshold = 50;

// create canvas
const canvas = document.getElementById("canvas");
canvas.width = fft_size / 2 + axisMargin;
canvas.height = 400 + axisMargin;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "rgba(0,0,0,0.8)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// create canvas2
const canvas2 = document.getElementById("canvas2");
canvas2.width = canvas.width;
canvas2.height = canvas.height;
const ctx2 = canvas2.getContext("2d");
ctx2.fillStyle = "rgba(0,0,0,0.8)";
ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

const file = document.getElementById("file-input");
file.onchange = () => {
    // read file
    const files = file.files;
    console.log(files[0]);
    const audio = document.getElementById("audio");
    audio.src = URL.createObjectURL(files[0]);

    // web audio api
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    const oscillator = context.createOscillator();
    let src = context.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(context.destination);

    // FFT 的 window size
    // 下面的其中一個值 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768.
    // 因爲 FFT 的演算法
    analyser.fftSize = fft_size;

    let decibelRange = analyser.maxDecibels - analyser.minDecibels;

    // print information
    document.getElementById("number_of_channels").innerHTML = "Number of Cannels: " + oscillator.channelCount;
    document.getElementById("sample_rate").innerHTML = "Sample Rate: " + context.sampleRate + " hz";
    document.getElementById("frequency").innerHTML = "Min / Max Frequency: " + 0 + " hz / " + context.sampleRate / 2 + " hz";
    document.getElementById("fft_size").innerHTML = "FFT Size: " + fft_size;
    document.getElementById("frequency_bit_count").innerHTML = "Frequency Bit Count: " + fft_size / 2;
    document.getElementById("frequency_resolution").innerHTML = "Frequency Resolution: " + context.sampleRate / fft_size;
    document.getElementById("decibels").innerHTML = "Max / Min Decibels: " + analyser.maxDecibels + " / " + analyser.minDecibels;
    document.getElementById("threshold").innerHTML = "Threshold: " + (analyser.maxDecibels - (threshold * decibelRange / 255));

    // add x-axis and y-axis


    // set variable before loop
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    // const dataArray = new Float32Array(analyser.frequencyBinCount);
    let bars = fft_size / 2;
    let x = 0;
    let barWidth = 1;
    let times = [];
    let fps = 0;
    let lastWhiteBarRenderX = 0;


    // draw canvas 2
    ctx2.fillStyle = "rgba(0,0,0,1)";
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
    // draw axis on canvas2
    ctx2.fillStyle = "white";
    ctx2.font = "10px Arial";
    ctx2.fillRect(axisMargin - 1, canvas.height - axisMargin + 1, canvas.width, 1);
    ctx2.fillRect(axisMargin - 1, 0, 1, canvas.height - axisMargin + 1);
    for(let i = 0; i < canvas2.height - axisMargin + 50; i += 50){
        ctx2.fillRect(axisMargin - 10, i, 10, 1);
        ctx2.fillText(Math.round(i * context.sampleRate / 2 / (canvas.height - axisMargin)), axisMargin - 45, i + 5);
    }
    for(let i = 0; i < canvas2.width; i += 60){
        ctx2.fillRect(i + axisMargin, canvas.height - axisMargin + 1, 1, 10);
        ctx2.fillText(i / 50, i + axisMargin - 5, canvas.height - axisMargin + 25);
    }



    // render the bar chart
    let renderFrame = () => {
        let whiteBarRenderX = Math.round(context.currentTime * 50 + 3);
        requestAnimationFrame(renderFrame);

        // 將 audio data 填充到 dataArray
        analyser.getByteFrequencyData(dataArray);
        // analyser.getFloatFrequencyData(dataArray);
        // console.log(dataArray);

        // draw canvas
        ctx.fillStyle = "rgba(0,0,0,0.2)"
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 在 canva 上畫 x 軸 y 軸
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillRect(axisMargin - 1, canvas.height - axisMargin + 1, canvas.width, 1);
        ctx.fillRect(axisMargin - 1, 0, 1, canvas.height - axisMargin + 1);
        for(let i = 0; i < fft_size / 2; i += 60){
            ctx.fillRect(i + axisMargin, canvas.height - axisMargin + 1, 1, 10);
            ctx.fillText(Math.round(i * context.sampleRate / fft_size * 10) / 10, i + axisMargin - 5, canvas.height - axisMargin + 25);
        }
        for(let i = 0; i < canvas.height - axisMargin + 50; i += 50){
            ctx.fillRect(axisMargin - 10, i, 10, 1);
            ctx.fillText((i * decibelRange / (canvas.height - axisMargin)) - 100, axisMargin - 45, i + 5);
        }

        // draw canvas2
        ctx2.fillStyle = "white";
        ctx2.fillRect((whiteBarRenderX % (21 * 50) + axisMargin), 0, 3, canvas2.height - axisMargin);
        ctx2.fillStyle = "black"
        ctx2.fillRect(lastWhiteBarRenderX % (21 * 50) + axisMargin, 0, 3, canvas2.height - axisMargin);
        lastWhiteBarRenderX = whiteBarRenderX;

        x = 0;
        for (let i = 0; i < bars; i++){
            barHeight = (dataArray[i]);

            ctx.fillStyle = "red";
            ctx.fillRect(x + axisMargin, (canvas.height - barHeight) - axisMargin, barWidth, barHeight);

            // x += barWidth + 5;
            x += 1;

            if (dataArray[i] > threshold){
                ctx2.fillStyle = "white";
                ctx2.fillRect(lastWhiteBarRenderX % (21 * 50) - 3 + axisMargin, i * (canvas2.height - axisMargin) / (fft_size / 2), 1, 1);
            }
        }

        if (whiteBarRenderX % (21 * 50 + 3) == 0) {
            ctx2.fillStyle = "black";
            ctx2.fillRect(axisMargin, 0, canvas2.width - axisMargin, canvas2.height - axisMargin);
        }



        // print fps
        const now = performance.now();
        while (times.length > 0 && times[0] <= now - 1000) {
          times.shift();
        }
        times.push(now);
        fps = times.length;
        document.getElementById("fps").innerHTML = "Render FPS: " + fps;

    }

    audio.play();
    renderFrame();
}




