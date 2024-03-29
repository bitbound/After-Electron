Set-Content -Path ".\Components\Commands\All.ts" -Value $null
$NewContent = "";
Get-ChildItem -Path ".\Components\Commands\" -Filter "*.ts" | ForEach-Object {
    if ($_.Name -notlike "All.ts") {
        $FileName = $_.Name.Split(".")[0];
        $NewContent = "import $FileName from `"./$FileName`";`r`n" + $NewContent
        $NewContent = $NewContent +  "export { $FileName };`r`n"
    }
}
Set-Content -Path ".\Components\Commands\All.ts" -Value $NewContent.Trim();

Set-Content -Path ".\Components\SocketMessages\All.ts" -Value $null
$NewContent = "";
Get-ChildItem -Path ".\Components\SocketMessages\" -Filter "*.ts" | ForEach-Object {
    if ($_.Name -notlike "All.ts") {
        $FileName = $_.Name.Split(".")[0];
        $NewContent = "import {Send$FileName, Receive$FileName} from `"./$FileName`";`r`n" + $NewContent
        $NewContent = $NewContent +  "export { Send$FileName, Receive$FileName };`r`n"
    }
}
Set-Content -Path ".\Components\SocketMessages\All.ts" -Value $NewContent.Trim();


Set-Content -Path ".\Components\All.ts" -Value $null
$NewContent = "";
Get-ChildItem -Path ".\Components\" -Filter "*.ts" | ForEach-Object {
    if ($_.Name -notlike "All.ts") {
        $FileName = $_.Name.Split(".")[0];
        $NewContent = "import * as $FileName from `"./$FileName`";`r`n" + $NewContent
        $NewContent = $NewContent +  "export { $FileName };`r`n"
    }
}
Set-Content -Path ".\Components\All.ts" -Value $NewContent.Trim();


Set-Content -Path ".\Models\All.ts" -Value $null
$NewContent = "";
Get-ChildItem -Path ".\Models\" -Filter "*.ts" | ForEach-Object {
    if ($_.Name -notlike "All.ts") {
        $FileName = $_.Name.Split(".")[0];
        $NewContent = $NewContent +  "export * from `"./$FileName`";`r`n" 
    }
}
Set-Content -Path ".\Models\All.ts" -Value $NewContent.Trim();

Set-Content -Path ".\API\All.ts" -Value $null
$NewContent = "";
Get-ChildItem -Path ".\API\" -Filter "*.ts" | ForEach-Object {
    if ($_.Name -notlike "All.ts") {
        $FileName = $_.Name.Split(".")[0];
        $NewContent = "import * as $FileName from `"./$FileName`";`r`n" + $NewContent
        $NewContent = $NewContent +  "export { $FileName };`r`n"
    }
}
Set-Content -Path ".\API\All.ts" -Value $NewContent.Trim();