console.log("Hello");

/** @type {WebGLRenderingContext} */
let gl = null;
/** @type {HTMLCanvasElement} */
let canvas = null;

let shaders = {};
let programs = {};
let nextHandle = 1;

let currentBlendSrc = null;
let currentBlendDst = null;

let lastTime = 0;

const currKeys = new Set();
let prevKeys = new Set();

const MonoGameKeys = Object.freeze(
    {
        // Movement / Actions
        Space: 32,  // Keys.Space
        Enter: 13,  // Keys.Enter
        Escape: 27,  // Keys.Escape

        // Arrow Keys
        ArrowLeft: 37,  // Keys.Left
        ArrowUp: 38,  // Keys.Up
        ArrowRight: 39,  // Keys.Right
        ArrowDown: 40,  // Keys.Down

        // Standard WASD Letters
        KeyA: 65,  // Keys.A
        KeyD: 68,  // Keys.D
        KeyS: 83,  // Keys.S
        KeyW: 87   // Keys.W
    });


window.addEventListener("keydown", event => {
    currKeys.add(MonoGameKeys[event.code]);
});

window.addEventListener("keyup", event => {
    currKeys.delete(MonoGameKeys[event.code]);
});

let exportsReady = false;
let exports;
let runtime;

export function initialize(dotnetExports, dotnetRuntime) {
    exports = dotnetExports;
    runtime = dotnetRuntime;
    exportsReady = true;
}

export function keyDownCurrently(code) {
    return currKeys.has(code);
}

export function keyDownPreviousy(code) {
    return prevKeys.has(code);
}

export function setCanvasSize(width, height) {
    canvas.width = width;
    canvas.height = height;
}

export function setBuffer(programId, buffer, data, attributeName, size) {
    const program = programs[programId];
    const location = gl.getAttribLocation(program, attributeName);

    if (location === -1) {
        // IMPORTANT: disable stale attribute if it was enabled before
        // You must know or track attribute locations you previously used
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

export function createBuffer() {
    return gl.createBuffer();
}

export function setIndexBuffer(data, indexBuffer) {
    const uint16Data = new Uint16Array(data);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, uint16Data, gl.STATIC_DRAW);
}

export function createFrameBuffer(texture) {
    const fbo = gl.createFramebuffer();

    bindFrameBuffer(fbo);

    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );

    return fbo;
}

export function bindFrameBuffer(fbo) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
}

export function clearFrameBuffer(framebuffer, r, g, b, a) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

export function createTexture(width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType, null);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    return texture;
}

// To flip texture:
//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

export function returnArray(ptr, length) {
    return new Float32Array(runtime.Module.HEAPF32.buffer, ptr, length);
}

export function drawPrimitives(vertexCount) {
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

export function drawIndexedPrimitives(indexCount, w, h) {
    gl.viewport(0, 0, w == -1 ? canvas.width : w, h == -1 ? canvas.height : h);

    gl.drawElements(
        gl.TRIANGLES,        // primitive type
        indexCount,     // number of indices
        gl.UNSIGNED_SHORT,  // type of indices
        0                   // offset in index buffer
    );

    for (let i = 0; i < 3; i++) {
        gl.disableVertexAttribArray(i);
    }
}

export function setSamplerState(texture, min, mag, wrapS, wrapT, anisotropy) {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    if (anisotropy > 1) {
        const ext = gl.getExtension("EXT_texture_filter_anisotropic");
        if (ext) {
            gl.texParameterf(
                gl.TEXTURE_2D,
                ext.TEXTURE_MAX_ANISOTROPY_EXT,
                anisotropy
            );
        }
    }
}

export function setBlendState(src, dst) {
    if (src === currentBlendSrc && dst === currentBlendDst)
        return;

    currentBlendSrc = src;
    currentBlendDst = dst;

    gl.enable(gl.BLEND);
    gl.blendFunc(src, dst);
}

export function startGameLoop() {
    function frame(time) {

        if (!exportsReady) {
            requestAnimationFrame(frame);
            return;
        }

        const deltaTime = (time - lastTime) / 1000.0;
        lastTime = time;

        //console.log(deltaTime);

        exports.FintaneMGFramework.Web.WebExports.OnAnimationFrame(deltaTime);

        prevKeys.clear();
        for (const key of currKeys) {
            prevKeys.add(key);
        }

        requestAnimationFrame(frame);

    }

    requestAnimationFrame(frame);
}

export function setUniform2f(location, x, y) {
    gl.uniform2f(location, x, y)
}

export function setUniform1f(location, x) {
    gl.uniform1f(location, x)
}

export function setUniformMatrix4fv(location, data) {
    gl.uniformMatrix4fv(location, false, data);
}

export function setUniformTexture(location, data, textureUnit) {
    //const textureLocation = getUniformLocation(programId, "u_texture");
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, data);
    gl.uniform1i(location, textureUnit);
}

export function getUniformLocation(programId, name) {
    return gl.getUniformLocation(programs[programId], name)
}

export function createFloat32Array(values) {
    return new Float32Array(values);
}

export function initWebGL(width, height) {
    canvas = document.querySelector("#gameCanvas");
    if (!canvas) {
        throw new Error("Could not find #gameCanvas.");
    }

    setCanvasSize(width, height);

    gl = canvas.getContext("webgl");
    if (!gl) {
        throw new Error("WebGL is not available.");
    }

    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    return 1; // success
}

export function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth || 1920;
    const displayHeight = canvas.clientHeight || 1080;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

export function useProgram(programId) {
    gl.useProgram(programs[programId]);
}

export function createProgram(vertexShaderId, fragmentShaderId) {
    const program = gl.createProgram();
    gl.attachShader(program, shaders[vertexShaderId]);
    gl.attachShader(program, shaders[fragmentShaderId]);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return 0;
    }

    const id = nextHandle++;
    programs[id] = program;

    return id;
}

export function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return 0;
    }

    const id = nextHandle++;
    shaders[id] = shader;
    return id;
}

export async function loadFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}`);
    }
    return await response.text();
}
