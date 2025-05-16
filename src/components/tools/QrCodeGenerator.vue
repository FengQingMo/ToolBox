<template>
  <div class="wrapper">
    <div class="mod-bg">
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.4)"></use>
          <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.6)"></use>
          <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.2)"></use>
          <use xlink:href="#gentle-wave" x="48" y="7" fill="rgba(255,255,255,1)"></use>
        </g>
      </svg>
    </div>

    <div class="container">
      <div class="mod-panel">
        <div class="inner">
          <div class="hd">
            <div class="title">
              <h1>二维码生成器</h1>
            </div>
          </div>
          <div class="bd">
            <div class="view-box">
              <div class="qrcode-container">
                <widget-qrcode 
                  ref="qrcode" 
                  :value="qrValue"
                  :template="currentStyle.template"
                  :background-color="currentStyle.backgroundColor"
                  :foreground-color="currentStyle.foregroundColor"
                  :inner-color="currentStyle.innerColor"
                  :outer-color="currentStyle.outerColor"
                  :background-image="currentStyle.backgroundImage"
                  :logo="currentStyle.logo"
                  :foreground-image="currentStyle.foregroundImage"
                  :level="currentStyle.level"
                ></widget-qrcode>
                
                <div class="download-buttons">
                  <button class="download-btn" @click="downloadQRCode('png')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    下载PNG
                  </button>
                </div>
              </div>
            </div>
            <div class="setting-box">
              <div class="box">
                <div class="c-hd">
                  <span class="title">基本设置</span>
                </div>
                <div class="c-bd">
                  <div class="input-wrapper">
                    <div class="input-title"><span>文本内容</span></div>
                    <div class="input-content">
                      <input type="search" v-model="qrValue" placeholder="请在此输入二维码内容" maxlength="48"/>
                    </div>
                  </div>
                  <div class="style-grid">
                    <div 
                      v-for="(style, index) in presetStyles" 
                      :key="index"
                      class="style-item"
                      :class="{ active: currentStyleIndex === index }"
                      @click="selectStyle(index)"
                    >
                      <widget-qrcode 
                        :value="'示例'"
                        :template="style.template"
                        :background-color="style.backgroundColor"
                        :foreground-color="style.foregroundColor"
                        :inner-color="style.innerColor"
                        :outer-color="style.outerColor"
                        :background-image="style.backgroundImage"
                        :logo="style.logo"
                        :foreground-image="style.foregroundImage"
                        :level="style.level"
                      ></widget-qrcode>
                    
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../../components/widget-qrcode-main/dist/widget-qrcode.min.js'

// Import images
import girlBg from '../../assets/image/bg/girl.jpeg'
import monkeyBg from '../../assets/image/bg/monkey.jpeg'
import snailLogo from '../../assets/image/logo/snail.png'
import grassSkin from '../../assets/image/skin/grass.png'
import earthLogo from '../../assets/image/logo/earth.png'
import octopusLogo from '../../assets/image/logo/octopus.png'

export default {
  name: 'QRCode',
  data() {
    return {
      qrValue: 'https://passer-by.com/',
      currentStyleIndex: 0,
      presetStyles: [
        {
          name: '融合风格-女孩',
          template: 'fusion',
          level: 'M',
          backgroundImage: girlBg,
          backgroundColor: '#ffcc60'
        },
        {
          name: '融合风格-猴子',
          template: 'fusion',
          backgroundImage: monkeyBg,
          backgroundColor: '#ece8dd',
          foregroundColor: '#000000'
        },
        {
          name: '菱形风格',
          template: 'diamond',
          logo: snailLogo,
          foregroundImage: grassSkin,
          backgroundColor: '#fff2dc',
          innerColor: '#094304'
        },
        {
          name: '水波风格',
          template: 'water',
          logo: earthLogo,
          foregroundColor: '#6d327c,#485DA6,#00a1ba,#00BF98,#36C486',
          backgroundColor: '#f1f8ff',
          innerColor: '#845EC2'
        },
        {
          name: '心形风格',
          template: 'heart',
          logo: octopusLogo,
          foregroundColor: '#ff9999',
          backgroundColor: '#fff7f7',
          innerColor: '#ce5050'
        },
        {
          name: '六边形风格',
          template: 'hexagon',
          foregroundColor: '#17252a,#2b7a78,#3aafa9',
          backgroundColor: '#def2f1',
          innerColor: '#17252a'
        },
        {
          name: '条形风格',
          template: 'bar',
          foregroundColor: '#3b8686,#79bd9a,#f8ca00,#008c9e',
          backgroundColor: '#f0f5f9',
          innerColor: '#3B4E32'
        },
        {
          name: '闪烁风格',
          template: 'glitter',
          foregroundColor: '#fe4365,#fc9d9a,#6d9d88,#490a3d',
          backgroundColor: '#f9f1f1',
          innerColor: '#881600',
          outerColor: '#343838'
        },
        {
          name: '方块风格',
          template: 'rect',
          foregroundColor: '#4abdac,#fc4a1a,#f7b733',
          backgroundColor: '#f9f6f3',
          innerColor: '#d66c44',
          outerColor: '#037584'
        },
        {
          name: '星星风格',
          template: 'star',
          level: 'L',
          foregroundColor: '#fc9000,#ffa935,#ffb756',
          backgroundColor: '#034690'
        },
        {
          name: '描边风格',
          template: 'stroke',
          foregroundColor: '#150f3f,#fb3242,#018bf8',
          backgroundColor: '#edfaff'
        }
      ],
      downloadOptions: {
        width: 1000,
        height: 1000,
        type: 'image/png'
      }
    }
  },
  computed: {
    currentStyle() {
      return this.presetStyles[this.currentStyleIndex]
    }
  },
  methods: {
    selectStyle(index) {
      this.currentStyleIndex = index
    },
    resetOptions() {
      this.qrValue = 'https://passer-by.com/'
      this.currentStyleIndex = 0
      alert('所有选项已重置')
    },
    downloadQRCode(type) {
      if (type === 'png') {
        // 获取widget-qrcode组件的canvas
        const qrcodeEl = this.$refs.qrcode;
        if (qrcodeEl && qrcodeEl.shadowRoot) {
          const canvas = qrcodeEl.shadowRoot.querySelector('canvas');
          if (canvas) {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qrcode.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            alert('未找到二维码画布');
          }
        } else {
          alert('未找到二维码组件');
        }
      }
    },
  }
}
</script>

<style>
@import '/src/components/widget-qrcode-main/static/style/index.css';

.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
  overflow-y: auto;
}

.mod-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  z-index: 1;
}

.container {
  position: relative;
  z-index: 2;
  padding: 20px;
  box-sizing: border-box;
}

.mod-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.inner {
  padding: 20px;
}

.hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: #333;
}

.bd {
  display: flex;
  flex-direction: row;
}

@media (max-width: 768px) {
  .bd {
    flex-direction: column;
  }
  
  .hd {
    flex-direction: column;
    align-items: flex-start;
  }
}

.view-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  min-height: 350px;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.download-buttons {
  display: flex;
  gap: 10px;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  background-color: #1677ff;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.download-btn:hover {
  background-color: #0958d9;
}

.download-btn svg {
  width: 14px;
  height: 14px;
}

.setting-box {
  flex: 1;
  padding-left: 20px;
}

@media (max-width: 768px) {
  .setting-box {
    padding-left: 0;
    padding-top: 20px;
  }
}

.box {
  margin-bottom: 20px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
}

.c-hd {
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-bottom: 1px solid #eaeaea;
}

.c-hd .title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
  display: block;
}

.c-bd {
  padding: 15px;
}

.input-wrapper {
  margin-bottom: 15px;
}

.input-title {
  margin-bottom: 8px;
}

.input-title span {
  font-size: 14px;
  color: #666;
}

.input-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.input-content input[type="search"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.input-content label {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-right: 10px;
  margin-bottom: 5px;
  cursor: pointer;
}

.input-content input[type="radio"] {
  margin-right: 5px;
}

.input-content input[type="color"] {
  width: 30px;
  height: 30px;
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
}

/* 高级选项样式 */
.advanced-options {
  margin-top: 20px;
  border-top: 1px solid #eaeaea;
  padding-top: 15px;
}

.option-group {
  margin-bottom: 15px;
  width: 100%;
}

.option-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.option-group input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.color-input {
  display: flex;
  align-items: center;
}

.color-input input[type="color"] {
  width: 30px;
  height: 30px;
  border: 1px solid #d9d9d9;
  padding: 0;
  background: none;
  cursor: pointer;
}

/* 文件上传样式 */
.file-input-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.file-input-group input[type="text"] {
  flex: 1;
}

.file-upload {
  position: relative;
}

.file-upload input[type="file"] {
  display: none;
}

.upload-btn {
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.upload-btn:hover {
  background-color: #e6e6e6;
}

@media (max-width: 800px) {
  .container {
    padding: 10px;
  }
  
  .file-input-group {
    flex-direction: column;
    gap: 5px;
  }
  
  .upload-btn {
    width: 100%;
  }
  
  .download-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .download-btn {
    width: 100%;
    justify-content: center;
  }
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.style-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 8px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.style-item:hover {
  border-color: #1890ff;
  background: #f0f9ff;
}

.style-item.active {
  border-color: #1890ff;
  background: #e6f7ff;
}

.style-item widget-qrcode {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}

.style-name {
  font-size: 12px;
  color: #666;
  text-align: center;
}

@media (max-width: 768px) {
  .style-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
}
</style>