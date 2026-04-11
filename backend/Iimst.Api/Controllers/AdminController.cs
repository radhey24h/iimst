using System.Diagnostics;
using System.IO.Compression;
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

    /// <summary>Creates a full dump under the shared volume /backup (for restore-on-deploy).</summary>
    [HttpPost("backup")]
    public async Task<ActionResult> TriggerBackup()
    {
        var backupRoot = _configuration["MongoBackup:RootPath"] ?? "/backup";
        var (ok, stdout, stderr, _) = await RunMongodumpScriptAsync(backupRoot).ConfigureAwait(false);
        if (!ok)
        {
            return StatusCode(500, new
            {
                message = "Backup failed.",
                error = string.IsNullOrWhiteSpace(stderr) ? "Unknown backup error." : stderr.Trim()
            });
        }

        var metadata = ParseScriptOutput(stdout);
        _logger.LogInformation("Volume backup completed. Dir={BackupDir}, Size={BackupSize}", metadata.BackupDir, metadata.BackupSize);

        return Ok(new
        {
            message = "Backup created successfully.",
            backupDir = metadata.BackupDir,
            durationSeconds = metadata.DurationSeconds,
            backupSize = metadata.BackupSize
        });
    }

    /// <summary>Creates a fresh mongodump, zips it, and returns it as a file download for the admin browser.</summary>
    [HttpGet("backup/download")]
    public async Task<IActionResult> DownloadBackup()
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), "iimst-dl-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(tempRoot);

        var (ok, stdout, stderr, _) = await RunMongodumpScriptAsync(tempRoot).ConfigureAwait(false);
        if (!ok)
        {
            TryDeleteDir(tempRoot);
            _logger.LogError("Download backup mongodump failed: {StdErr}", stderr);
            return StatusCode(500, new
            {
                message = "Backup failed.",
                error = string.IsNullOrWhiteSpace(stderr) ? "Unknown backup error." : stderr.Trim()
            });
        }

        var metadata = ParseScriptOutput(stdout);
        if (string.IsNullOrWhiteSpace(metadata.BackupDir) || !Directory.Exists(metadata.BackupDir))
        {
            TryDeleteDir(tempRoot);
            return StatusCode(500, new { message = "Backup produced no output directory." });
        }

        var stamp = DateTime.UtcNow.ToString("yyyy-MM-dd-HHmm");
        var downloadName = $"iimst-mongodb-backup-{stamp}.zip";
        var zipPath = Path.Combine(Path.GetTempPath(), "iimst-" + Guid.NewGuid().ToString("N") + ".zip");

        try
        {
            ZipFile.CreateFromDirectory(metadata.BackupDir, zipPath, CompressionLevel.Fastest, includeBaseDirectory: false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Zip creation failed for backup download");
            TryDeleteDir(tempRoot);
            if (System.IO.File.Exists(zipPath)) try { System.IO.File.Delete(zipPath); } catch { /* ignore */ }
            return StatusCode(500, new { message = "Failed to package backup.", error = ex.Message });
        }

        TryDeleteDir(tempRoot);

        var stream = new FileStream(
            zipPath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read,
            65536,
            FileOptions.DeleteOnClose);

        _logger.LogInformation("Serving backup download {FileName}", downloadName);
        return File(stream, "application/zip", downloadName);
    }

    private async Task<(bool Ok, string Stdout, string Stderr, int ExitCode)> RunMongodumpScriptAsync(string backupRoot)
    {
        var scriptPath = "/app/scripts/backup.sh";
        if (!System.IO.File.Exists(scriptPath))
        {
            _logger.LogError("Backup script not found at {ScriptPath}", scriptPath);
            return (false, "", "Backup script is missing.", -1);
        }

        var mongoConnection = _configuration["MongoDb:ConnectionString"] ?? "mongodb://root:example@mongodb:27017/?authSource=admin";
        var mongoDbName = _configuration["MongoDb:DatabaseName"] ?? "iimst";

        var mongoUri = new MongoDB.Driver.MongoUrl(mongoConnection);
        var mongoHost = string.IsNullOrWhiteSpace(mongoUri.Server.Host) ? "mongodb" : mongoUri.Server.Host;
        var mongoPort = mongoUri.Server.Port < 1 ? 27017 : mongoUri.Server.Port;
        var mongoUser = mongoUri.Username ?? _configuration["MONGO_INITDB_ROOT_USERNAME"] ?? "root";
        var mongoPass = mongoUri.Password ?? _configuration["MONGO_INITDB_ROOT_PASSWORD"] ?? "example";
        var mongoAuthDb = mongoUri.AuthenticationSource ?? "admin";

        if (string.IsNullOrWhiteSpace(mongoUser) || string.IsNullOrWhiteSpace(mongoPass))
            return (false, "", "MongoDB credentials are not configured for backup.", -1);

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

        using var process = Process.Start(psi);
        if (process == null)
            return (false, "", "Failed to start backup process.", -1);

        var stdoutTask = process.StandardOutput.ReadToEndAsync();
        var stderrTask = process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync().ConfigureAwait(false);
        var stdout = await stdoutTask.ConfigureAwait(false);
        var stderr = await stderrTask.ConfigureAwait(false);

        return (process.ExitCode == 0, stdout, stderr, process.ExitCode);
    }

    private static void TryDeleteDir(string path)
    {
        try
        {
            if (Directory.Exists(path))
                Directory.Delete(path, recursive: true);
        }
        catch
        {
            // best-effort cleanup
        }
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
