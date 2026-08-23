/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-manager-header-v1
 */

// 平台类型定义
export const PlatformTypes = {
  WINDOWS: 1,
  MACOS: 2,
  IOS: 3,
  ANDROID: 4,
  HARMONYOS: 5
} as const;

// 平台名称映射
export const PlatformNames = {
  [PlatformTypes.WINDOWS]: 'Windows',
  [PlatformTypes.MACOS]: 'MacOS',
  [PlatformTypes.IOS]: 'iOS',
  [PlatformTypes.ANDROID]: 'Android',
  [PlatformTypes.HARMONYOS]: 'HarmonyOS'
} as const;

// 平台描述映射
export const PlatformDescriptions = {
  [PlatformTypes.WINDOWS]: 'Windows操作系统',
  [PlatformTypes.MACOS]: '苹果MacOS操作系统（电脑）',
  [PlatformTypes.IOS]: '苹果iOS操作系统（手机/平板）',
  [PlatformTypes.ANDROID]: '安卓操作系统',
  [PlatformTypes.HARMONYOS]: '鸿蒙操作系统'
} as const;

// 架构类型定义
export const ArchTypes = {
  H5: 0,           // H5网页版本
  WIN_X64: 1,      // Windows x64架构
  WIN_ARM64: 2,    // Windows ARM64架构
  MAC_INTEL: 3,    // MacOS Intel架构
  MAC_APPLE: 4,    // MacOS Apple芯片架构
  IOS: 5,          // iOS通用版本
  ANDROID: 6,      // Android通用版本
  HARMONYOS: 7     // 鸿蒙系统通用版本
} as const;

// 架构名称映射
export const ArchNames = {
  [ArchTypes.H5]: 'H5',
  [ArchTypes.WIN_X64]: 'WinX64',
  [ArchTypes.WIN_ARM64]: 'WinArm64',
  [ArchTypes.MAC_INTEL]: 'MacIntel',
  [ArchTypes.MAC_APPLE]: 'MacApple',
  [ArchTypes.IOS]: 'iOS',
  [ArchTypes.ANDROID]: 'Android',
  [ArchTypes.HARMONYOS]: 'HarmonyOS'
} as const;

// 架构描述映射
export const ArchDescriptions = {
  [ArchTypes.H5]: 'H5网页版本',
  [ArchTypes.WIN_X64]: 'Windows Intel x64 (64位)',
  [ArchTypes.WIN_ARM64]: 'Windows ARM64 (Surface等设备)',
  [ArchTypes.MAC_INTEL]: 'MacOS Intel版本',
  [ArchTypes.MAC_APPLE]: 'MacOS Apple Silicon (M1/M2/M3系列)',
  [ArchTypes.IOS]: 'iOS通用版本',
  [ArchTypes.ANDROID]: 'Android通用版本',
  [ArchTypes.HARMONYOS]: '鸿蒙系统通用版本'
} as const;

// 架构对应的平台ID
export const ArchPlatforms = {
  [ArchTypes.H5]: 0,           // H5不属于特定平台
  [ArchTypes.WIN_X64]: PlatformTypes.WINDOWS,
  [ArchTypes.WIN_ARM64]: PlatformTypes.WINDOWS,
  [ArchTypes.MAC_INTEL]: PlatformTypes.MACOS,
  [ArchTypes.MAC_APPLE]: PlatformTypes.MACOS,
  [ArchTypes.IOS]: PlatformTypes.IOS,
  [ArchTypes.ANDROID]: PlatformTypes.ANDROID,
  [ArchTypes.HARMONYOS]: PlatformTypes.HARMONYOS
} as const;

// 平台对应的架构类型
export const PlatformArchs = {
  [PlatformTypes.WINDOWS]: [ArchTypes.WIN_X64, ArchTypes.WIN_ARM64],
  [PlatformTypes.MACOS]: [ArchTypes.MAC_INTEL, ArchTypes.MAC_APPLE],
  [PlatformTypes.IOS]: [ArchTypes.IOS],
  [PlatformTypes.ANDROID]: [ArchTypes.ANDROID],
  [PlatformTypes.HARMONYOS]: [ArchTypes.HARMONYOS]
} as const;

// 获取平台名称
export const getPlatformName = (platformId: number): string => {
  return PlatformNames[platformId as keyof typeof PlatformNames] || '未知平台';
};

// 获取平台描述
export const getPlatformDescription = (platformId: number): string => {
  return PlatformDescriptions[platformId as keyof typeof PlatformDescriptions] || '未知平台';
};

// 获取架构名称
export const getArchName = (archId: number): string => {
  return ArchNames[archId as keyof typeof ArchNames] || '未知架构';
};

// 获取架构描述
export const getArchDescription = (archId: number): string => {
  return ArchDescriptions[archId as keyof typeof ArchDescriptions] || '未知架构';
};

// 获取架构对应的平台ID
export const getArchPlatform = (archId: number): number => {
  return ArchPlatforms[archId as keyof typeof ArchPlatforms] || 0;
};

// 获取平台下可用的架构列表
export const getAvailableArchs = (platformId: number): readonly number[] => {
  return PlatformArchs[platformId as keyof typeof PlatformArchs] || [];
}; 