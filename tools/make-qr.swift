// 店頭用QRコードを作る（Mac標準の機能だけで動きます。有料サービス不要）
//
// 使い方（ichikawa-chaya フォルダで実行）：
//   swift tools/make-qr.swift "https://（公開先のアドレス）/menu.html" assets/img/qr-menu.png
//
// 作ったあと data.js の qr を次のように変えます：
//   qr: { image: "assets/img/qr-menu.png", isSample: false }

import Foundation
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 3, let url = URL(string: args[1]), url.scheme == "https" else {
    print("使い方: swift tools/make-qr.swift \"https://.../menu.html\" assets/img/qr-menu.png")
    print("※ https:// から始まる、公開済みのアドレスを指定してください")
    exit(1)
}

let filter = CIFilter(name: "CIQRCodeGenerator")!
filter.setValue(args[1].data(using: .utf8), forKey: "inputMessage")
filter.setValue("M", forKey: "inputCorrectionLevel")
let raw = filter.outputImage!
let scale = (1000 / raw.extent.width).rounded(.down)
let qr = raw.samplingNearest().transformed(by: CGAffineTransform(scaleX: scale, y: scale))

let context = CIContext()
let cg = context.createCGImage(qr, from: qr.extent)!
let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, cg, nil)
CGImageDestinationFinalize(dest)
print("作成しました: \(args[2])  →  \(args[1])")
