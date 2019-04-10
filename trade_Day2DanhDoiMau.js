//day 2 danh 1 con khac mau
function TP()
{
	$("<div id='divTP'></div>").appendTo($("body"));
	$("#divTP")[0].tpObj = this;

	this.fTradeAmount = 1;
	this.fMinProfit = 10;
	this.fMaxProfit = 50;
	this.nBeginTrade = 2;
	this.nMaxFollowTrade = 2;
	this.strSelTrade = "both";
	this.nPrevTradeCell = 0;
	this.nTradeWin = 0;
	this.nTradeLose = 0;
	this.fBalanceValue = 0;
	this.fMaxBalanceValue = 0;
	this.fMinBalanceValue = 0;
	this.bStop = false;
	this.nRows = 6;
	this.nCols = 10;
	this.nCount = 60;
	this.strCurTrade = "";
	this.nCurTrade = 0;
	this.tmrTrade = null;

	this.getTradeResult = getTradeResult;
	this.isBeginTrade = isBeginTrade;
	this.trade = trade;
	this.start = start;
	this.startTrade = startTrade;
	this.getProfit = getProfit;
	this.stop = stop;

	function getTradeResult(nCell)
	{
		var nRow = 0, nCol = 0;
		if (nCell > 0)
		{
			nRow = nCell % this.nRows - 1;
			nCol = Math.floor(nCell / this.nRows);
			if (nCell % this.nRows == 0)
			{
				nRow += 6;
				nCol -= 1;
			}
			
			if ($(".result-table:eq(0) tr:eq(" + nRow + ") img:eq(" + nCol + ")")[0].src.indexOf("result-green.png") != -1)
			{
				return "green";
			}
			else if ($(".result-table:eq(0) tr:eq(" + nRow + ") img:eq(" + nCol + ")")[0].src.indexOf("result-red.png") != -1)
			{
				return "red";
			}
			else if ($(".result-table:eq(0) tr:eq(" + nRow + ") img:eq(" + nCol + ")")[0].src.indexOf("result-gold.png") != -1)
			{
				return "gold";
			}
			else
			{
				return "null";
			}
		}
	}
	
	function isBeginTrade(nCurCell)
	{
		var strCurRst = this.getTradeResult(nCurCell);
		var i = 1, nCount = 1, strPrevRst = "", strRet = "'" + strCurRst + "'";
		while (i < this.nBeginTrade)
		{
			strPrevRst = this.getTradeResult(nCurCell - i);
			strRet += " '" + strPrevRst + "'";
			if (strPrevRst == strCurRst)
				nCount++;
			i++;
		}
		console.log("strPrevRst = " + strRet);
		return (nCount == this.nBeginTrade);
	}

	function trade(strTrade, fAmount)
	{
		$("#bet-amount").val(fAmount);
		this.strCurTrade = strTrade;
		if (strTrade == "red")
		{
			$("#btn-sell1").click();
		}
		else
		{
			$("#btn-buy1").click();
		}
		this.nCurTrade++;
		console.log("Trade " + this.nCurTrade + ": '" + strTrade + "' " + (fAmount.toFixed(2)) + "$");
	}

	function start(opts)
	{
		if (opts != null && opts.fTradeAmount != null && opts.fMinProfit != null && opts.fMaxProfit != null 
			&& opts.nBeginTrade != null && opts.nMaxFollowTrade != null && opts.strSelTrade != null)
		{
			console.log("Start trade");

			this.fTradeAmount = opts.fTradeAmount;
			this.fMinProfit = opts.fMinProfit;
			this.fMaxProfit = opts.fMaxProfit;
			this.nBeginTrade = opts.nBeginTrade;
			this.nMaxFollowTrade = opts.nMaxFollowTrade;
			this.strSelTrade = opts.strSelTrade;

			this.fBalanceValue = parseFloat($("#balance-value").text());
			this.fMaxBalanceValue = this.fBalanceValue + this.fMaxProfit + this.fTradeAmount;
			this.fMinBalanceValue = this.fBalanceValue - this.fMinProfit - this.fTradeAmount;
			console.log("fBalanceValue = " + this.fBalanceValue.toFixed(2));
			console.log("fMaxBalanceValue = " + this.fMaxBalanceValue.toFixed(2));
			console.log("fMinBalanceValue = " + this.fMinBalanceValue.toFixed(2));
			
			if (opts.nCurTrade != null)
				this.nCurTrade = opts.nCurTrade;

			this.startTrade();
		}
		else
		{
			console.log("Please enter full parameters.");
		}
	}

	function startTrade()
	{
		if ($("#time-to-bet-text-1").text().indexOf("ORDER") == -1)
		{
			var nWaiting = parseInt($("#time-to-bet-number-1").text()) + 10;
			this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, nWaiting * 1000);
			return;
		}

		var nCurBalanceValue = parseFloat($("#balance-value").text());
		if (!this.bStop && nCurBalanceValue < this.fMaxBalanceValue && nCurBalanceValue > this.fMinBalanceValue)
		{
			var strCurRst = "";
			var nCurCell = this.nCount - $(".result-table:eq(0) .result-icon img[src*='result-null.png']").length;
			
			console.log("------------------------------");
			console.log("Process cell " + nCurCell + "...");
			this.getProfit();

			if (nCurCell > 1)
			{
				if (this.nPrevTradeCell == 0 || this.nPrevTradeCell != nCurCell)
				{
					this.nPrevTradeCell = nCurCell;
				}
				else
				{
					console.log("*************************************************************************************");
					console.log("******************* Network error! Please refresh and try again! *******************");
					console.log("*************************************************************************************");
					this.stop();
					return;
				}
			
				strCurRst = this.getTradeResult(nCurCell);
				console.log("strCurTrade = '" + this.strCurTrade + "'");
				console.log("strCurRst = '" + strCurRst + "'");
				if (this.strCurTrade == "")//first trade
				{
					if (this.isBeginTrade(nCurCell) && strCurRst != "gold" && strCurRst != "null"
					&& ((this.strSelTrade == "both") || (this.strSelTrade != "both" && strCurRst ==  this.strSelTrade)))
					{
						if (strCurRst ==  "red")
						{
							this.trade("green", this.fTradeAmount);
						}
						else
						{
							this.trade("red", this.fTradeAmount);
						}
					}
					else
					{
						console.log("Waiting...");
					}
				}
				else//following trade
				{
					console.log("nCurTrade = " + this.nCurTrade);
					if (this.nCurTrade < this.nMaxFollowTrade)
					{
						if (this.strCurTrade == strCurRst)//win
						{
							this.strCurTrade = "";
							this.nCurTrade = 0;

							this.nTradeWin++;
							console.log("Win " + this.nTradeWin + " (Lose " + this.nTradeLose + ")");
							console.log("Waiting...");
						}
						else
						{
							console.log("Follow");
							this.trade(this.strCurTrade, this.fTradeAmount * Math.pow(2, this.nCurTrade));
						}
					}
					else
					{
						if (this.strCurTrade == strCurRst)
						{
							if (this.nCurTrade <= this.nMaxFollowTrade)
							{
								this.nTradeWin++;
								console.log("Win " + this.nTradeWin + " (Lose " + this.nTradeLose + ")");
							}
							else
							{
								this.nTradeLose++;
								console.log("Lose " + this.nTradeLose + " (Win " + this.nTradeWin + ")");
							}
							console.log("Waiting...");

							this.strCurTrade = "";
							this.nCurTrade = 0;
						}
						else
						{
							this.nCurTrade++;
							console.log("Waiting...");
						}
					}
				}
			}
			else
			{
				this.strCurTrade = "";
				this.nCurTrade = 0;
				console.log("Waiting...");
			}

			this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, 60000);
		}
		else
		{
			this.stop();
		}
	}

	function getProfit()
	{
		console.log("------------------------------");
		var nCurBalanceValue = parseFloat($("#balance-value").text());
		var nCurProfit = nCurBalanceValue - this.fBalanceValue;
		console.log("fBalanceValue = " + this.fBalanceValue.toFixed(2));
		console.log(".fMaxBalanceValue = " + this.fMaxBalanceValue.toFixed(2));
		console.log(".fMinBalanceValue = " + this.fMinBalanceValue.toFixed(2));
		console.log("nCurBalanceValue = " + nCurBalanceValue.toFixed(2));
		
		if (nCurProfit > 0)
			console.log("+++ Win " + (nCurProfit.toFixed(2)) + "$ +++");
		else if (nCurProfit < 0)
			console.log("--- Lose " + ((nCurProfit * -1).toFixed(2)) + "$ ---");
		else
			console.log("... Tie ...");
	}

	function stop()
	{
		this.nPrevTradeCell = 0;
		this.strCurTrade = "";
		this.nCurTrade = 0;
		this.bStop = true;
		clearTimeout(this.tmrTrade);
		console.log("Stop trade");
		this.getProfit();
		console.log("Win " + this.nTradeWin + " - Lose " + this.nTradeLose);
	}
};
var s = new TP();
console.clear();
s.start({ fTradeAmount: 1, fMinProfit: 10, fMaxProfit: 50, nBeginTrade: 2, nMaxFollowTrade: 4, strSelTrade: "green", nCurTrade: 0 });