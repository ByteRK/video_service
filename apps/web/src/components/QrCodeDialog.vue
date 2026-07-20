<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import QRCode from 'qrcode';
import { ElMessage } from 'element-plus';

const props = defineProps<{ modelValue: boolean; url: string; name: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const canvas = ref<HTMLCanvasElement>();
const visible = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) });

watch(() => [props.modelValue, props.url], async ([opened]) => {
  if (!opened || !props.url) return;
  await nextTick();
  if (canvas.value) await QRCode.toCanvas(canvas.value, props.url, { width: 280, margin: 2, errorCorrectionLevel: 'M' });
}, { immediate: true });

function download() {
  if (!canvas.value) return;
  const link = document.createElement('a');
  link.href = canvas.value.toDataURL('image/png');
  link.download = `${safeName(props.name)}-二维码.png`;
  link.click();
  ElMessage.success('二维码已下载');
}

function safeName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '_').trim() || '视频';
}
</script>

<template>
  <el-dialog v-model="visible" title="视频二维码" width="min(390px, 92vw)" align-center>
    <div class="qr-wrap">
      <canvas ref="canvas" />
      <div class="name">{{ name }}</div>
      <div class="url">{{ url }}</div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="download">下载二维码</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.qr-wrap{text-align:center}.qr-wrap canvas{display:block;max-width:100%;height:auto;margin:0 auto}.name{margin-top:12px;font-weight:500;word-break:break-word}.url{margin-top:6px;color:#909399;font-size:12px;line-height:1.5;word-break:break-all}
</style>
