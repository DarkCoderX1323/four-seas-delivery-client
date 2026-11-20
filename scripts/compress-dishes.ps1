Add-Type -AssemblyName System.Drawing

$dishesPath = Join-Path (Split-Path $PSScriptRoot -Parent) "frontend\public\images\dishes"
if (-not (Test-Path $dishesPath)) {
    $dishesPath = Join-Path $PSScriptRoot "frontend\public\images\dishes"
}
$dishesPath = Resolve-Path $dishesPath -ErrorAction Stop

$heavyPngs = Get-ChildItem -Path $dishesPath -Filter "*.png" | Where-Object { $_.Length -gt (300 * 1024) }

if ($heavyPngs.Count -eq 0) {
    Write-Host "Ya no hay PNG pesados. Todo esta optimizado." -ForegroundColor Green
    exit 0
}

Write-Host "Comprimiendo $($heavyPngs.Count) imagen(es) PNG a JPG..." -ForegroundColor Cyan

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$qualityParam = New-Object System.Drawing.Imaging.EncoderParameters(1)
$qualityParam.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)
$totalSaved = 0

foreach ($pngFile in $heavyPngs) {
    $baseName  = [System.IO.Path]::GetFileNameWithoutExtension($pngFile.Name)
    $dstPath   = Join-Path $dishesPath "$baseName.jpg"
    $srcSizeKB = [math]::Round($pngFile.Length / 1024, 1)

    Write-Host "  $($pngFile.Name)  ($srcSizeKB KB)  ->  $baseName.jpg" -ForegroundColor Yellow

    try {
        $img = [System.Drawing.Image]::FromFile($pngFile.FullName)
        $bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $g   = [System.Drawing.Graphics]::FromImage($bmp)
        $g.Clear([System.Drawing.Color]::White)
        $g.DrawImage($img, 0, 0, $img.Width, $img.Height)
        $g.Dispose()
        $img.Dispose()

        $bmp.Save($dstPath, $jpegCodec, $qualityParam)
        $bmp.Dispose()

        $dstSizeKB = [math]::Round((Get-Item $dstPath).Length / 1024, 1)
        $savedKB   = [math]::Round($srcSizeKB - $dstSizeKB, 1)
        $totalSaved += $savedKB
        Write-Host "    OK: $dstSizeKB KB  (ahorrado: $savedKB KB)" -ForegroundColor Green
    } catch {
        Write-Host "    ERROR: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Listo! Espacio liberado total: $totalSaved KB" -ForegroundColor Green
