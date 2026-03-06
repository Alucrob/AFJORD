; ═══════════════════════════════════════════════════════
;  AFJORD — Custom NSIS Installer Script
; ═══════════════════════════════════════════════════════

!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro customInit
!macroend

!macro customInstall
  ; Create desktop shortcut with custom icon
  CreateShortCut "$DESKTOP\AFJORD.lnk" "$INSTDIR\AFJORD.exe" "" "$INSTDIR\AFJORD.exe" 0

  ; Write install info to registry for Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AFJORD" \
    "DisplayName" "AFJORD"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AFJORD" \
    "Publisher" "AFJORD"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AFJORD" \
    "DisplayVersion" "1.0.8"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AFJORD" \
    "URLInfoAbout" "https://github.com/Alucrob/Rom-Scraper"
!macroend

!macro customUnInstall
  ; Clean up registry on uninstall
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AFJORD"
  ; Remove desktop shortcut
  Delete "$DESKTOP\AFJORD.lnk"
!macroend
