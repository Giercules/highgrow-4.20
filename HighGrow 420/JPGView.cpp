#include "StdAfx.h"
#include "Picture.h"

extern "C" BOOL HGIDrawFileWindow(HWND hwnd, HDC hdc, LPCTSTR lpFileName);
extern "C" BOOL HGILoadGrowroomResourceImage(HINSTANCE hInst, UINT uiRes);
extern "C" BOOL HGILoadGrowroomFileImage(LPCTSTR lpFileName);
extern "C" void HGIFreeGrowroomImage(void);
extern "C" void HGIRenderGrowroomImage(HDC hdc, RECT rc);
extern "C" BOOL HGILoadRoomEditImage(HINSTANCE hInst, UINT uiRes);
extern "C" void HGIFreeRoomEditImage(void);
extern "C" void HGIRenderRoomEditImage(HDC hdc, RECT rc);

static CPicture JPG_file;
static CPicture JPG_Growroom;
static BOOL bGrowroomLoaded = FALSE;
static CPicture JPG_RoomEdit;
static BOOL bRoomEditLoaded = FALSE;

BOOL HGIDrawFileWindow(HWND hwnd, HDC hdc, LPCTSTR lpFileName)
{
	RECT rc;
	GetClientRect(hwnd, &rc);
	if (JPG_file.Load(lpFileName)) {
		JPG_file.Render(hdc, &rc, NULL);
		JPG_file.Free();
		return TRUE;
	}
	return FALSE;
}

BOOL HGILoadGrowroomResourceImage(HINSTANCE hInst, UINT uiRes)
{
	if (bGrowroomLoaded)
		return FALSE;
	bGrowroomLoaded = JPG_Growroom.Load(hInst, uiRes);
	return bGrowroomLoaded;
}

BOOL HGILoadGrowroomFileImage(LPCTSTR lpFileName)
{
	if (bGrowroomLoaded)
		return FALSE;
	bGrowroomLoaded = JPG_Growroom.Load(lpFileName);
	return bGrowroomLoaded;
}

void HGIFreeGrowroomImage(void)
{
	if (bGrowroomLoaded) {
		JPG_Growroom.Free();
		bGrowroomLoaded = FALSE;
	}
}

void HGIRenderGrowroomImage(HDC hdc, RECT rc)
{
	if (bGrowroomLoaded)
		JPG_Growroom.Render(hdc, &rc, NULL);
}

BOOL HGILoadRoomEditImage(HINSTANCE hInst, UINT uiRes)
{
	if (bRoomEditLoaded)
		return FALSE;
	bRoomEditLoaded = JPG_RoomEdit.Load(hInst, uiRes);
	return bRoomEditLoaded;
}

void HGIFreeRoomEditImage(void)
{
	if (bRoomEditLoaded) {
		JPG_RoomEdit.Free();
		bRoomEditLoaded = FALSE;
	}
}

void HGIRenderRoomEditImage(HDC hdc, RECT rc)
{
	if (bRoomEditLoaded)
		JPG_RoomEdit.Render(hdc, &rc, NULL);
}