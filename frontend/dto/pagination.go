package dto

type (
	PaginationRequest struct {
		Search  string `form:"search"`
		Page    int    `form:"page"`
		PerPage int    `form:"per_page"`
	}

	TransactionPaginationRequest struct {
		Search    string `form:"search"`
		Page      int    `form:"page"`
		PerPage   int    `form:"per_page"`
		Filter    string `form:"filter"`
		Range     string `form:"range"`
		Cabang    int    `form:"cabang"`
		StartDate string `form:"start_date"`
		EndDate   string `form:"end_date"`
	}

	PaginationResponse struct {
		Page    int   `json:"page"`
		PerPage int   `json:"per_page"`
		MaxPage int64 `json:"max_page"`
		Count   int64 `json:"count"`
	}
)

func (p *PaginationRequest) GetOffset() int {
	return (p.Page - 1) * p.PerPage
}

func (p *PaginationResponse) GetLimit() int {
	return p.PerPage
}

func (p *PaginationResponse) GetPage() int {
	return p.Page
}
