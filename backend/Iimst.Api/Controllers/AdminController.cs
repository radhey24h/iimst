using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IConfiguration configuration, ILogger<AdminController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("backup")]
    public async Task<ActionResult> TriggerBackup()
    {
        var scriptPath = "/app/scripts/backup.sh";
        if (!System.IO.File.Exists(scriptPath))
        {
            _logger.LogError("Backup script not found at {ScriptPath}", scriptPath);
            return StatusCode(500, new { message = "Backup script is missing." });
        }

        var mongoConnection = _configuration["MongoDb:ConnectionString"] ?? "mongodb://root:example@mongodb:27017/?authSource=admin";
        var mongoDbName = _configuration["MongoDb:DatabaseName"] ?? "iimst";
        var backupRoot = _configuration["MongoBackup:RootPath"] ?? "/backup";

        var mongoUri = new MongoDB.Driver.MongoUrl(mongoConnection);
        var mongoHost = string.IsNullOrWhiteSpace(mongoUri.Server.Host) ? "mongodb" : mongoUri.Server.Host;
        var mongoPort = mongoUri.Server.Port;
        var mongoUser = mongoUri.Username ?? _configuration["MONGO_INITDB_ROOT_USERNAME"] ?? "root";
        var mongoPass = mongoUri.Password ?? _configuration["MONGO_INITDB_ROOT_PASSWORD"] ?? "example";
        var mongoAuthDb = mongoUri.AuthenticationSource ?? "admin";

        if (string.IsNullOrWhiteSpace(mongoUser) || string.IsNullOrWhiteSpace(mongoPass))
        {
            return StatusCode(500, new { message = "MongoDB credentials are not configured for backup." });
        }

        var psi = new ProcessStartInfo
        {
            FileName = "/bin/bash",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };
        psi.ArgumentList.Add(scriptPath);
        psi.Environment["MONGO_HOST"] = mongoHost;
        psi.Environment["MONGO_PORT"] = mongoPort.ToString();
        psi.Environment["MONGO_USERNAME"] = mongoUser;
        psi.Environment["MONGO_PASSWORD"] = mongoPass;
        psi.Environment["MONGO_AUTH_DB"] = mongoAuthDb;
        psi.Environment["MONGO_DB_NAME"] = mongoDbName;
        psi.Environment["BACKUP_ROOT"] = backupRoot;

        var stopwatch = Stopwatch.StartNew();
        using var process = Process.Start(psi);
        if (process == null)
        {
            return StatusCode(500, new { message = "Failed to start backup process." });
        }

        var stdout = await process.StandardOutput.ReadToEndAsync();
        var stderr = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();
        stopwatch.Stop();

        if (process.ExitCode != 0)
        {
            _logger.LogError("Backup command failed. ExitCode={ExitCode}, StdErr={StdErr}", process.ExitCode, stderr);
            return StatusCode(500, new
            {
                message = "Backup failed.",
                error = string.IsNullOrWhiteSpace(stderr) ? "Unknown backup error." : stderr.Trim()
            });
        }

        var metadata = ParseScriptOutput(stdout);
        _logger.LogInformation("Backup completed in {ElapsedMs}ms. Dir={BackupDir}, Size={BackupSize}", stopwatch.ElapsedMilliseconds, metadata.BackupDir, metadata.BackupSize);

        return Ok(new
        {
            message = "Backup created successfully.",
            backupDir = metadata.BackupDir,
            durationSeconds = metadata.DurationSeconds,
            backupSize = metadata.BackupSize
        });
    }

    private static (string BackupDir, string DurationSeconds, string BackupSize) ParseScriptOutput(string stdout)
    {
        string backupDir = "";
        string durationSeconds = "";
        string backupSize = "";

        foreach (var line in stdout.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (line.StartsWith("BACKUP_DIR=", StringComparison.Ordinal))
                backupDir = line["BACKUP_DIR=".Length..];
            else if (line.StartsWith("DURATION_SECONDS=", StringComparison.Ordinal))
                durationSeconds = line["DURATION_SECONDS=".Length..];
            else if (line.StartsWith("BACKUP_SIZE=", StringComparison.Ordinal))
                backupSize = line["BACKUP_SIZE=".Length..];
        }

        return (backupDir, durationSeconds, backupSize);
    }
}
