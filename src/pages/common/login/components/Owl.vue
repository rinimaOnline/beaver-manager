<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-manager
  https://github.com/wsrh8888/beaver-manager

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-manager-header-v1
-->

<script lang="ts" setup>
interface Props {
  closeEyes: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <div class="owl" :class="{ 'owl-password': props.closeEyes }">
    <div class="hand-down-left" />
    <div class="hand-down-right" />
    <div class="hand-up-left" />
    <div class="hand-up-right" />
    <div class="close-eyes" />
  </div>
</template>

<style lang="less" scoped>
@mixin backgroundImage($url) {
  background-image: url($url);
  background-repeat: no-repeat;
  background-size: 100%;
}

.owl {
  position: relative;
  width: 120px;
  height: 95px;
  transform: translateY(12%);
  @include backgroundImage("../images/face.png");
  .hand-down-left,
  .hand-down-right {
    z-index: 2;
    position: absolute;
    width: 45px;
    height: 25px;
    transition: transform 0.2s linear;
  }
  .hand-down-left {
    bottom: 3px;
    left: -35px;
    @include backgroundImage("../images/hand-down-left.png");
  }
  .hand-down-right {
    bottom: 3px;
    right: -40px;
    @include backgroundImage("../images/hand-down-right.png");
  }
  .hand-up-left,
  .hand-up-right {
    z-index: 3;
    position: absolute;
    width: 50px;
    height: 40px;
    opacity: 0;
    transition: opacity 0.1s linear 0.1s;
  }
  .hand-up-left {
    bottom: 11px;
    left: -5px;
    @include backgroundImage("../images/hand-up-left.png");
  }
  .hand-up-right {
    bottom: 11px;
    right: 5px;
    @include backgroundImage("../images/hand-up-right.png");
  }
  .close-eyes {
    z-index: 1;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.1s linear 0.1s;
    @include backgroundImage("../images/close-eyes.png");
  }
}

.owl-password {
  .hand-down-left {
    transform: translateX(30px) scale(0) translateY(-10px);
  }
  .hand-down-right {
    transform: translateX(-40px) scale(0) translateY(-10px);
  }
  .hand-up-left,
  .hand-up-right,
  .close-eyes {
    opacity: 1;
  }
}
</style>
