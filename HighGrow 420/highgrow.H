

HWND ghwndMain;

int HGCalculatePlants(HWND hWnd, HINSTANCE hInst, BOOL bVisible);
int HGSimulateTestPlants(HWND hWnd, HINSTANCE hInst, int iTargetDay);
LRESULT CALLBACK MainWndProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam);
BOOL DoCommand(HWND hwnd, WPARAM wParam, HINSTANCE ghInst);

