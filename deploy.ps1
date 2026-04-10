$SERVER_IP = "39.106.120.241"
$SERVER_USER = "root"
$PROJECT_PATH = "D:\前端\EnglishProject"
$REMOTE_PATH = "/home/admin/EnglishProject"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开始部署 EnglishProject" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/5] 构建前端..." -ForegroundColor Yellow
Set-Location "$PROJECT_PATH\apps\web"
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "前端构建失败!" -ForegroundColor Red
    exit 1
}
Write-Host "前端构建完成!" -ForegroundColor Green

Write-Host "`n[2/5] 构建后端 Server..." -ForegroundColor Yellow
Set-Location "$PROJECT_PATH\server"
npx nest build server
if ($LASTEXITCODE -ne 0) {
    Write-Host "后端 Server 构建失败!" -ForegroundColor Red
    exit 1
}
Write-Host "后端 Server 构建完成!" -ForegroundColor Green

Write-Host "`n[3/5] 构建后端 AI..." -ForegroundColor Yellow
npx nest build ai
if ($LASTEXITCODE -ne 0) {
    Write-Host "后端 AI 构建失败!" -ForegroundColor Red
    exit 1
}
Write-Host "后端 AI 构建完成!" -ForegroundColor Green

Write-Host "`n[4/5] 上传文件到服务器..." -ForegroundColor Yellow
Write-Host "上传前端 dist..." -ForegroundColor Gray
scp -r "$PROJECT_PATH\apps\web\dist" "$SERVER_USER@$SERVER_IP`:$REMOTE_PATH/apps/web/"

Write-Host "上传后端 dist..." -ForegroundColor Gray
scp -r "$PROJECT_PATH\server\dist" "$SERVER_USER@$SERVER_IP`:$REMOTE_PATH/server/"

Write-Host "上传 ecosystem.config.js..." -ForegroundColor Gray
scp "$PROJECT_PATH\ecosystem.config.js" "$SERVER_USER@$SERVER_IP`:$REMOTE_PATH/"

Write-Host "上传完成!" -ForegroundColor Green

Write-Host "`n[5/5] 重启服务器服务..." -ForegroundColor Yellow
ssh "$SERVER_USER@$SERVER_IP" "cd $REMOTE_PATH && pm2 restart all && pm2 status"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "部署完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n访问地址:" -ForegroundColor White
Write-Host "  前端: http://$SERVER_IP`:8080" -ForegroundColor Cyan
Write-Host "  后端: http://$SERVER_IP`:3000" -ForegroundColor Cyan
Write-Host "  MinIO: http://$SERVER_IP`:9001" -ForegroundColor Cyan
