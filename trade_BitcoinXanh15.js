//Bitcoin xanh 15
function TP()
{
	$("<div id='divTP'></div>").appendTo($("body"));
	$("#divTP")[0].tpObj = this;

	this.fTradeAmount = 1;
	this.fMinProfit = 10;
	this.fMaxProfit = 50;
	this.nBeginTrade = 1;
	this.nMaxFollowTrade = 4;
	this.strSelTrade = "green";
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
	this.strTradeStatus = "out";
	this.bWaiting = false;
	this.arrCurTableRst = null;
	this.arrPrevTableRst = null;
	this.arrCurSelTradeChain = null;
	this.arrPrevSelTradeChain = null;
	this.nCurChainCell = 0;
	this.tmrTrade = null;

	this.getTableResult = getTableResult;
	this.updateSelTradeChain = updateSelTradeChain;
	this.getSelTradeChain = getSelTradeChain;
	this.getFullSelTradeChain = getFullSelTradeChain;
	this.getTradeResult = getTradeResult;
	this.getCurrentCell = getCurrentCell;
	this.isBeginTrade = isBeginTrade;
	this.trade = trade;
	this.start = start;
	this.startTrade = startTrade;
	this.getProfit = getProfit;
	this.stop = stop;

	function getTableResult()
	{
		this.arrPrevTableRst = this.arrCurTableRst;
		this.arrCurTableRst = [];
		this.arrPrevSelTradeChain = this.arrCurSelTradeChain;
		this.arrCurSelTradeChain = [];
		this.nCurChainCell = 0;

		var nCurCell = this.getCurrentCell();
		var i = 1, nCount = 0;
		for (; i <= nCurCell; i++)
		{
			this.arrCurTableRst[i] = this.getTradeResult(i);
			if (this.arrCurTableRst[i] == this.strSelTrade)
			{
				nCount++;
			}
			else
			{
				if (nCount > 0)
				{
					this.nCurChainCell = nCurCell;
					this.arrCurSelTradeChain[this.arrCurSelTradeChain.length] = nCount;
					nCount = 0;
				}
			}
		}
	}

	function updateSelTradeChain()
	{
		var nCurCell = this.getCurrentCell();
		var i = this.nCurChainCell, nCount = 0;
		for (; i <= nCurCell; i++)
		{
			if (this.arrCurTableRst[i] == this.strSelTrade)
			{
				nCount++;
			}
			else
			{
				if (nCount > 0)
				{
					this.nCurChainCell = nCurCell;
					this.arrCurSelTradeChain[this.arrCurSelTradeChain.length] = nCount;
					nCount = 0;
				}
			}
		}
	}

	function getSelTradeChain()
	{
		console.log("arrPrevSelTradeChain = [" + (this.arrPrevSelTradeChain != null ? this.arrPrevSelTradeChain.join(" ") : "") + "]");
		console.log("arrCurSelTradeChain = [" + (this.arrCurSelTradeChain != null ? this.arrCurSelTradeChain.join(" ") : "") + "]");
	}

	function getFullSelTradeChain()
	{
		var i = 0, nCount = 0, arrRst = [];
		if (this.arrPrevSelTradeChain != null && this.arrPrevSelTradeChain.length > 0)
		{
			for (i = 0; i < this.arrPrevSelTradeChain.length; i++)
				arrRst[i] = this.arrPrevSelTradeChain[i];
			nCount = this.arrPrevSelTradeChain.length;
		}
		for (i = 0; i < this.arrCurSelTradeChain.length; i++)
			arrRst[i + nCount] = this.arrCurSelTradeChain[i];
		console.log("arrFullSelTradeChain = [" + (arrRst != null ? arrRst.join(" ") : "") + "]");
		return arrRst;
	}

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
		var strCurRst = this.arrCurTableRst[nCurCell];
		if (strCurRst != this.strSelTrade)
			return false;

		var i = 1, nCount = 0, arrRst = [];
		if (this.arrPrevTableRst != null && this.arrPrevTableRst.length > 0)
		{
			for (i = 1; i <= this.nCount; i++)
				arrRst[i] = this.arrPrevTableRst[i];
			nCount = this.nCount;
		}
		for (i = 1; i <= this.nCount; i++)
			arrRst[i + nCount] = this.arrCurTableRst[i];

		i = nCurCell + nCount;
		while (i > 0 && arrRst[i] == this.strSelTrade 
			&& arrRst[i] != "gold" && arrRst[i] != "null")
		{
			i--;
		}

		if (i > 0)
		{
			if (nCurCell + nCount - i != this.nBeginTrade)//ko du nBeginTrade
				return false;

			while (i > 0 && arrRst[i] != this.strSelTrade)//&& arrRst[i] != "gold" && arrRst[i] != "null"
			{
				i--;
			}

			if (i > 1 && arrRst[i] == this.strSelTrade && arrRst[i - 1] == this.strSelTrade)
			{//co day 2+ truoc do
				return true;
			}
		}

		return false;
	}

	function getCurrentCell()
	{
		var nCurCell = this.nCount - $(".result-table:eq(0) .result-icon img[src*='result-null.png']").length;
		return nCurCell;
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
		
		console.log("Trade " + (this.nCurTrade + 1) + ": '" + strTrade + "' " + (fAmount.toFixed(2)) + "$");
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
			var nCurCell = this.getCurrentCell();

			if (nCurCell == 1 || this.arrCurTableRst == null)
			{
				this.getTableResult();
			}
			
			console.log("------------------------------");
			console.log("Process cell " + nCurCell + "...");
			this.getProfit();

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
		
			var strCurRst = this.getTradeResult(nCurCell);
			this.arrCurTableRst[nCurCell] = strCurRst;
			if (strCurRst != this.strSelTrade)
				this.updateSelTradeChain();
			console.log("strCurRst = '" + strCurRst + "'");
			console.log("bWaiting = " + this.bWaiting);
			console.log("strCurTrade = '" + this.strCurTrade + "'");
			console.log("nCurTrade = " + this.nCurTrade);

			this.getSelTradeChain();
			var arrSelTradeChain = this.getFullSelTradeChain();
			if (this.strTradeStatus == "out")
			{
				if (arrSelTradeChain.length >= 2)//1 day 2+ & 1 day 3+ lien tiep
				{
					if ((arrSelTradeChain[arrSelTradeChain.length - 1] >= 2 &&
					arrSelTradeChain[arrSelTradeChain.length - 2] >= 3) || 
					(arrSelTradeChain[arrSelTradeChain.length - 1] >= 3 &&
					arrSelTradeChain[arrSelTradeChain.length - 2] >= 2))
					{
						this.strTradeStatus = "in";
						console.log("Come back......");
					}
				}
			}
			else//in
			{
				if (arrSelTradeChain.length >= 5)//5 day 2- lien tiep
				{
					if (arrSelTradeChain[arrSelTradeChain.length - 1] <= 2 
						&& arrSelTradeChain[arrSelTradeChain.length - 2] <= 2
						&& arrSelTradeChain[arrSelTradeChain.length - 3] <= 2
						&& arrSelTradeChain[arrSelTradeChain.length - 4] <= 2
						&& arrSelTradeChain[arrSelTradeChain.length - 5] <= 2)
					{
						this.strTradeStatus = "out";
						console.log("Pause......");
					}
				}
			}
			console.log("strTradeStatus = '" + this.strTradeStatus + "'");

			if (this.strCurTrade == "")//trade
			{
				if (strCurRst != "gold" && strCurRst != "null")
				{
					if (strCurRst == this.strSelTrade)
					{
						if (this.isBeginTrade(nCurCell) && !this.bWaiting)
						{
							if (this.nCurTrade < this.nMaxFollowTrade)
							{
								if (this.strTradeStatus == "in")
								{
									this.trade(this.strSelTrade, this.fTradeAmount * Math.pow(2, this.nCurTrade));
									this.nCurTrade++;
								}
								else
								{
									this.bWaiting = false;
									console.log("Pause (waiting signal to come back)...");
								}
							}
							else
							{
								this.nCurTrade = 0;
								this.bWaiting = false;
								console.log("Ignore (reset - waiting next chain)...");
							}
						}
						else
						{
							if (this.bWaiting)
							{
								console.log("Waiting next signal...");
							}
							else
							{
								console.log("Waiting (not find signal)...");
							}
						}
					}
					else
					{
						this.bWaiting = false;
						console.log("Waiting (only trade '" + this.strSelTrade + "')...");
					}
				}
				else
				{
					console.log("Waiting (not trade 'gold')...");
				}
			}
			else//result
			{
				if (this.strCurTrade == strCurRst)//win
				{
					this.nCurTrade = 0;
					this.bWaiting = true;

					this.nTradeWin++;
					console.log("Win " + this.nTradeWin + " (Lose " + this.nTradeLose + ")");
				}
				else//lose
				{
					this.bWaiting = false;

					this.nTradeLose++;
					console.log("Lose " + this.nTradeLose + " (Win " + this.nTradeWin + ")");
				}
				
				this.strCurTrade = "";
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
		console.log("Win " + this.nTradeWin + " - Lose " + this.nTradeLose);
	}

	function stop()
	{
		this.nPrevTradeCell = 0;
		this.strCurTrade = "";
		this.nCurTrade = 0;
		this.strTradeStatus = "out";
		this.bStop = true;
		this.bWaiting = false;
		this.arrCurTableRst = null;
		this.arrPrevTableRst = null;
		this.arrCurSelTradeChain = null;
		this.arrPrevSelTradeChain = null;
		this.nCurChainCell = 0;
		clearTimeout(this.tmrTrade);
		console.log("Stop trade");
		this.getProfit();
	}
};
var s = new TP();
console.clear();
s.start({ fTradeAmount: 1, fMinProfit: 5, fMaxProfit: 50, nBeginTrade: 1, nMaxFollowTrade: 4, strSelTrade: "green", nCurTrade: 0 });