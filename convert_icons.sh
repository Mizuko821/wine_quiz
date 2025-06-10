#!/bin/bash

# 必要なパッケージのインストール確認
if ! command -v convert &> /dev/null; then
    echo "ImageMagickがインストールされていません。インストールしてください。"
    exit 1
fi

# アイコンサイズの配列
sizes=(72 96 128 144 152 167 180 192 384 512)

# 各サイズのPNGを生成
for size in "${sizes[@]}"; do
    convert -background none -size "${size}x${size}" icons/icon.svg "icons/icon-${size}x${size}.png"
done

# スプラッシュスクリーン用の画像を生成
convert -background "#8D1D2C" -size 2048x2048 icons/icon.svg -gravity center -extent 2048x2048 icons/splash.png

echo "アイコンの生成が完了しました。" 