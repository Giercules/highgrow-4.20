#pragma once

#include "StdAfx.h"

class CPicture {
public:
	CPicture();
	~CPicture();

	BOOL Load(HINSTANCE hInst, UINT nIDRes);
	BOOL Load(LPCTSTR pszPathName);
	BOOL Load(IStream* pstm);
	BOOL Render(HDC hdc, const RECT* prc, LPCRECT prcMFBounds = NULL) const;
	void GetImageSize(HDC hdc, LONG* pcx, LONG* pcy) const;
	void Free();

private:
	IPicture* m_pPicture;
};