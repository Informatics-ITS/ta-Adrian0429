package utils

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"
)

func GenerateRandomUPC() (string, error) {

	rand.Seed(time.Now().UnixNano())
	randomNumber := rand.Intn(100000000000)

	upc := fmt.Sprintf("%011d", randomNumber)

	checkDigit, err := CalculateCheckDigit(upc)
	if err != nil {
		return "", err
	}

	upc += strconv.Itoa(checkDigit)

	return upc, nil
}

func CalculateCheckDigit(upc string) (int, error) {
	if len(upc) != 11 {
		return 0, fmt.Errorf("UPC must be 11 digits")
	}

	sumOdd, sumEven := 0, 0

	for i, digit := range upc {
		digitValue, err := strconv.Atoi(string(digit))
		if err != nil {
			return 0, fmt.Errorf("invalid digit in UPC: %v", err)
		}
		if (i+1)%2 == 1 {

			sumOdd += digitValue
		} else {

			sumEven += digitValue
		}
	}

	totalSum := sumOdd*3 + sumEven

	checkDigit := (10 - (totalSum % 10)) % 10

	return checkDigit, nil
}

func ParseDate(date string) time.Time {
	layout := "2006-01-02"
	parsedDate, _ := time.Parse(layout, date)

	return parsedDate
}
