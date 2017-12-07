Set-Content -Path ".\Components\Index.ts" -Value $null
$NewContent = "";
Get-ChildItem -Path ".\Components\" -Filter "*.ts" | ForEach-Object {
    if ($_.Name -notlike "Index.ts") {
        $FileName = $_.Name.Split(".")[0];
        $NewContent = "import * as $($FileName.ToLower()) from `"./$FileName`";`r`n" + $NewContent
        $NewContent = $NewContent +  "export var $FileName = $($FileName.ToLower());`r`n"
    }
}
Set-Content -Path ".\Components\Index.ts" -Value $NewContent.Trim();

Set-Content -Path ".\Models\Index.ts" -Value $null
$NewContent = "";
Get-ChildItem -Path ".\Models\" -Filter "*.ts" | ForEach-Object {
    if ($_.Name -notlike "Index.ts") {
        $FileName = $_.Name.Split(".")[0];
        $NewContent = $NewContent +  "export * from `"./$FileName`";`r`n" 
    }
}
Set-Content -Path ".\Models\Index.ts" -Value $NewContent.Trim();
