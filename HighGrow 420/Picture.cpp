#include "StdAfx.h"
#include "Picture.h"

#ifndef HIMETRIC_PER_INCH
#define HIMETRIC_PER_INCH 2540
#endif

CPicture::CPicture()
	: m_pPicture(NULL)
{
}

CPicture::~CPicture()
{
	Free();
}

BOOL CPicture::Load(HINSTANCE hInst, UINT nIDRes)
{
	HRSRC hRsrc = ::FindResource(hInst, MAKEINTRESOURCE(nIDRes), "IMAGE");
	if (!hRsrc)
		return FALSE;

	DWORD len = SizeofResource(hInst, hRsrc);
	HGLOBAL hGlobal = ::LoadResource(hInst, hRsrc);
	BYTE* lpRsrc = (BYTE*)::LockResource(hGlobal);
	if (!lpRsrc || len == 0)
		return FALSE;

	HGLOBAL hCopy = GlobalAlloc(GMEM_MOVEABLE, len);
	if (!hCopy)
		return FALSE;

	void* pCopy = GlobalLock(hCopy);
	if (!pCopy) {
		GlobalFree(hCopy);
		return FALSE;
	}

	memcpy(pCopy, lpRsrc, len);
	GlobalUnlock(hCopy);

	IStream* pstm = NULL;
	if (FAILED(CreateStreamOnHGlobal(hCopy, TRUE, &pstm)))
		return FALSE;

	BOOL bRet = Load(pstm);
	pstm->Release();
	return bRet;
}

BOOL CPicture::Load(LPCTSTR pszPathName)
{
	HANDLE hFile = CreateFile(pszPathName, GENERIC_READ, FILE_SHARE_READ, NULL,
		OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	if (hFile == INVALID_HANDLE_VALUE)
		return FALSE;

	DWORD len = GetFileSize(hFile, NULL);
	if (len == INVALID_FILE_SIZE || len == 0) {
		CloseHandle(hFile);
		return FALSE;
	}

	HGLOBAL hGlobal = GlobalAlloc(GMEM_MOVEABLE, len);
	if (!hGlobal) {
		CloseHandle(hFile);
		return FALSE;
	}

	void* pData = GlobalLock(hGlobal);
	if (!pData) {
		GlobalFree(hGlobal);
		CloseHandle(hFile);
		return FALSE;
	}

	DWORD bytesRead = 0;
	BOOL bRead = ReadFile(hFile, pData, len, &bytesRead, NULL);
	GlobalUnlock(hGlobal);
	CloseHandle(hFile);

	if (!bRead || bytesRead != len) {
		GlobalFree(hGlobal);
		return FALSE;
	}

	IStream* pstm = NULL;
	if (FAILED(CreateStreamOnHGlobal(hGlobal, TRUE, &pstm)))
		return FALSE;

	BOOL bRet = Load(pstm);
	pstm->Release();
	return bRet;
}

BOOL CPicture::Load(IStream* pstm)
{
	if (!pstm)
		return FALSE;

	Free();
	return SUCCEEDED(OleLoadPicture(pstm, 0, FALSE, IID_IPicture, (void**)&m_pPicture))
		&& m_pPicture != NULL;
}

BOOL CPicture::Render(HDC hdc, const RECT* prc, LPCRECT prcMFBounds) const
{
	if (!m_pPicture || !hdc || !prc)
		return FALSE;

	RECT rc = *prc;
	if (rc.right <= rc.left || rc.bottom <= rc.top) {
		LONG cx = 0;
		LONG cy = 0;
		GetImageSize(hdc, &cx, &cy);
		rc.right = rc.left + cx;
		rc.bottom = rc.top + cy;
	}

	OLE_XSIZE_HIMETRIC hmWidth = 0;
	OLE_YSIZE_HIMETRIC hmHeight = 0;
	m_pPicture->get_Width(&hmWidth);
	m_pPicture->get_Height(&hmHeight);

	return SUCCEEDED(m_pPicture->Render(hdc, rc.left, rc.top, rc.right - rc.left,
		rc.bottom - rc.top, 0, hmHeight, hmWidth, -hmHeight, prcMFBounds));
}

void CPicture::GetImageSize(HDC hdc, LONG* pcx, LONG* pcy) const
{
	if (!pcx || !pcy)
		return;

	*pcx = 0;
	*pcy = 0;
	if (!m_pPicture)
		return;

	OLE_XSIZE_HIMETRIC hmWidth = 0;
	OLE_YSIZE_HIMETRIC hmHeight = 0;
	m_pPicture->get_Width(&hmWidth);
	m_pPicture->get_Height(&hmHeight);

	HDC hdcRef = hdc ? hdc : GetDC(NULL);
	if (!hdcRef)
		return;

	int logPixelsX = GetDeviceCaps(hdcRef, LOGPIXELSX);
	int logPixelsY = GetDeviceCaps(hdcRef, LOGPIXELSY);
	if (!hdc)
		ReleaseDC(NULL, hdcRef);

	*pcx = MulDiv(hmWidth, logPixelsX, HIMETRIC_PER_INCH);
	*pcy = MulDiv(hmHeight, logPixelsY, HIMETRIC_PER_INCH);
}

void CPicture::Free()
{
	if (m_pPicture) {
		m_pPicture->Release();
		m_pPicture = NULL;
	}
}