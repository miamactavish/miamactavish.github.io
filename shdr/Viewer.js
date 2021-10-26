import * as THREE from '../libs/threejs/build/three.module.js';
import { OBJLoader } from '../libs/threejs/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from '../libs/threejs/examples/jsm/controls/OrbitControls.js';

var Viewer = (function() {
  Viewer.FRAGMENT = 0;

  Viewer.VERTEX = 1;

  Viewer.UNIFORMS = 2;

  function Viewer(dom, app) {
    this.dom = dom;
    this.app = app;
    this.time = 0.0;
    this.rotate = false;
    this.currentModel = null;
    this.rotateRate = 0.005;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.canvas = this.renderer.domElement;

    this.dom.appendChild(this.canvas);
    shdr.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.dom.clientWidth / this.dom.clientHeight, 0.1, 100000);
    this.controls = new OrbitControls(this.camera, this.dom);
    shdr.scene.add(this.camera);

    this.vs = window.shdr.Snippets.DefaultVertex;
    this.fs = window.shdr.Snippets.DefaultFragment;

    // manager

    shdr.material = this.defaultMaterial();

    function loadModel() {

      shdr.object.traverse( function ( child ) {

        if ( child.isMesh ) child.material = shdr.material;
        //if ( child.isMesh ) child.material.map = material;
      } );

      //shdr.scene.add( this.object );

      var key = "models/sphere.obj";
      var geo = shdr.object;
      console.log("initializing");
      var data, old;
      this.currentModel = key;
      data = window.shdr.Models[key];
      if (shdr.model != null) {
        old = shdr.model.geometry;
        shdr.scene.remove(shdr.model);
        console.log("removed)");
        //old.dispose();
      }
      console.log(geo);
      shdr.model = geo;
      if (data != null) {
        if (data.scale != null) {
          shdr.model.scale.set(data.scale, data.scale, data.scale);
        }
      }
      shdr.scene.add(shdr.model);
      //return this.app.ui.hideModelLoader();
    }

    this.manager = new THREE.LoadingManager( loadModel );
    this.manager.onProgress = function ( item, loaded, total ) { console.log( item, loaded, total ); };

    function onProgress( xhr ) {
      if ( xhr.lengthComputable ) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
      }
    }
    function onError() {}

    // texture
    const textureLoader = new THREE.TextureLoader( this.manager );
    const texture = textureLoader.load( 'textures/beanie.jpg' );
    
    this.objLoader = new OBJLoader( this.manager );
    /*
    this.objLoader.load( 'models/sphere.obj', function ( obj ) {
      shdr.object = obj;
    }, onProgress, onError );
*/
    this.loadModel('models/sphere.obj');

    this.onResize();
    window.addEventListener('resize', ((function(_this) {
      return function() {
        return _this.onResize();
      };
    })(this)), false);
  }

  Viewer.prototype.update = function() {
    this.controls.update();
    this.time += 0.001;
    
    //this.uniforms.time.value = this.time;
    if (shdr.model && this.rotate) {
      shdr.model.rotation.y += this.rotateRate;
    }

    return this.renderer.render(shdr.scene, this.camera);
  };

  Viewer.prototype.reset = function() {
    return shdr.model.rotation.y = 0;
  };

  Viewer.prototype.onResize = function() {
    if (this.camera) {
      this.camera.aspect = this.dom.clientWidth / this.dom.clientHeight;
      this.camera.updateProjectionMatrix();
      this.camera.position.z = 900 / this.dom.clientWidth * 4;
      this.camera.lookAt(shdr.scene.position);
    }
    if (this.uniforms) {
      this.uniforms.resolution.value.x = this.dom.clientWidth;
      this.uniforms.resolution.value.y = this.dom.clientHeight;
    }
    return this.renderer.setSize(this.dom.clientWidth, this.dom.clientHeight);
  };

  Viewer.prototype.loadModel = function(key) {
    this.ext = key.split(".");
    
    this.objLoader.load(key, (function(obj) {
      
      shdr.object = obj;
      console.log("loading");
      return function(geo) {
      //  return _this.initModel(geo, key);
      };
    }));

    //return this.app.ui.showModelLoader();
  };

  Viewer.prototype.initModel = function(geo, key) {
    console.log("initializing");
    var data, old;
    this.currentModel = key;
    data = window.shdr.Models[key];
    if (shdr.model != null) {
      old = shdr.model.geometry;
      shdr.scene.remove(shdr.model);
      old.dispose();
    }
    console.log(geo);
    console.dir(geo);
    shdr.model = geo;
    if (data != null) {
      if (data.scale != null) {
        shdr.model.scale.set(data.scale, data.scale, data.scale);
      }
    }
    shdr.scene.add(shdr.model);
    return this.app.ui.hideModelLoader();
  };

  Viewer.prototype.updateShader = function(shader, mode) {
    if (mode == null) {
      mode = Viewer.FRAGMENT;
    }
    if (mode === Viewer.FRAGMENT) {
      this.fs = shader;
      shdr.material.fragmentShader = shader;
    } else if (mode === Viewer.UNIFORMS) {
      this.resetUniforms();
      this.addCustomUniforms(this.parseUniforms(shader));
      shdr.material.uniforms = this.uniforms;
    } else {
      this.vs = shader;
      shdr.material.vertexShader = shader;
    }
    return shdr.material.needsUpdate = true;
  };

  Viewer.prototype.resetUniforms = function() {
    return this.uniforms = {
      time: {
        type: 'f',
        value: this.time
      },
      resolution: {
        type: 'v2',
        value: new THREE.Vector2(this.dom.clientWidth, this.dom.clientHeight)
      }
    };
  };

  Viewer.prototype.parseUniforms = function(uniformStr) {
    var error, i, len, line, lineNum, name, ref, session, toParse, tokens, type, uniform, uniformObj, value, vectorVals;
    error = false;
    toParse = uniformStr.split(';');
    uniformObj = {};
    lineNum = 0;
    for (i = 0, len = toParse.length; i < len; i++) {
      line = toParse[i];
      lineNum += 1;
      console.log(line);
      if (!line.trim().length) {
        continue;
      }
      tokens = line.trim().split(' ');
      if (!tokens.length) {
        continue;
      }
      if (tokens.length < 4) {
        this.app.ui.setStatus('Invalid syntax at line ' + lineNum, window.shdr.UI.ERROR);
        session = this.app.editor.getSession();
        this.app.marker = session.highlightLines(lineNum - 1, lineNum - 1);
        error = true;
        continue;
      }
      type = tokens[0];
      name = tokens[1];
      value = tokens.slice(3).join(' ');
      if (tokens[2] !== '=') {
        this.app.ui.setStatus('Invalid syntax at line ' + lineNum + ': expected =', window.shdr.UI.ERROR);
        session = this.app.editor.getSession();
        this.app.marker = session.highlightLines(lineNum - 1, lineNum - 1);
        error = true;
        continue;
      }
      uniform = {};
      if (type === 'float') {
        uniform['type'] = 'f';
        uniform['value'] = parseFloat(value);
      } else if (type === 'int') {
        uniform['type'] = 'i';
        uniform['value'] = parseInt(value);
      } else if (type === 'bool') {
        uniform['type'] = 'i';
        uniform['value'] = (ref = value === 'true') != null ? ref : {
          1: 0
        };
      } else if (type === 'vec2') {
        vectorVals = value.slice(5, value.length - 1).split(',').map(parseFloat);
        if (vectorVals.length !== 2) {
          this.app.ui.setStatus('Invalid syntax at line ' + lineNum + ': wrong number of arguments', window.shdr.UI.ERROR);
          error = true;
        }
        uniform['type'] = 'v2';
        uniform['value'] = new THREE.Vector2(vectorVals[0], vectorVals[1]);
      } else if (type === 'vec3') {
        vectorVals = value.slice(5, value.length - 1).split(',').map(parseFloat);
        if (vectorVals.length !== 3) {
          this.app.ui.setStatus('Invalid syntax at line ' + lineNum + ': wrong number of arguments', window.shdr.UI.ERROR);
          error = true;
        }
        uniform['type'] = 'v3';
        uniform['value'] = new THREE.Vector3(vectorVals[0], vectorVals[1], vectorVals[2]);
      } else if (type === 'vec4') {
        vectorVals = value.slice(5, value.length - 1).split(',').map(parseFloat);
        if (vectorVals.length !== 4) {
          this.app.ui.setStatus('Invalid syntax at line ' + lineNum + ': wrong number of arguments', window.shdr.UI.ERROR);
          error = true;
        }
        uniform['type'] = 'v4';
        uniform['value'] = new THREE.Vector4(vectorVals[0], vectorVals[1], vectorVals[2], vectorVals[3]);
      } else if (type === 'sampler2D') {
        uniform['type'] = 't';
        value = value.replace(/^"(.*)"$/, '$1');
        value = value.replace(/^"(.*)"$/, "$1");
        
        var textureLoader = new THREE.TextureLoader();

        //uniform['value'] = THREE.ImageUtils.loadTexture(shdr.Textures[value].data);
        uniform['value'] = textureLoader.load(shdr.Textures[value].data);
      } else {
        this.app.ui.setStatus('Unrecognized uniform type at line ' + lineNum + ': ' + type, window.shdr.UI.ERROR);
        error = true;
      }
      if (!error) {
        uniformObj[name] = uniform;
        this.app.ui.setStatus('Uniforms successfully compiled', window.shdr.UI.SUCCESS);
      } else {
        session = this.app.editor.getSession();
        this.app.marker = session.highlightLines(lineNum - 1, lineNum - 1);
        continue;
      }
    }
    return uniformObj;
  };

  Viewer.prototype.addCustomUniforms = function(uniformsObj) {
    var key, results, value;
    results = [];
    for (key in uniformsObj) {
      value = uniformsObj[key];
      if (uniformsObj.hasOwnProperty(key)) {
        results.push(this.uniforms[key] = value);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Viewer.prototype.defaultMaterial = function() {
    this.resetUniforms();
    //this.addCustomUniforms(this.parseUniforms(shdr.Snippets.DefaultUniforms));
    
    return new THREE.RawShaderMaterial( {

      uniforms: this.uniforms,
      vertexShader: this.vs,
      fragmentShader: this.fs
    } );
  };

  return Viewer;

})();

window.shdr ||=  {};

window.shdr.Viewer = Viewer;
